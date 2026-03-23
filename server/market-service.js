const trackedIndices = [
  {
    symbol: "^GSPC",
    name: "S&P 500",
    region: "Estados Unidos",
    aliases: ["^GSPC", "S&P 500"],
  },
  {
    symbol: "^DJI",
    name: "Dow Jones",
    region: "Estados Unidos",
    aliases: ["^DJI", "Dow Jones", "Dow Jones Industrial Average"],
  },
  {
    symbol: "^IXIC",
    name: "Nasdaq",
    region: "Estados Unidos",
    aliases: ["^IXIC", "Nasdaq", "NASDAQ Composite"],
  },
  {
    symbol: "^FTSE",
    name: "FTSE 100",
    region: "Reino Unido",
    aliases: ["^FTSE", "FTSE 100"],
  },
  {
    symbol: "^GDAXI",
    name: "DAX",
    region: "Alemanha",
    aliases: ["^GDAXI", "DAX"],
  },
  {
    symbol: "^FCHI",
    name: "CAC 40",
    region: "Franca",
    aliases: ["^FCHI", "CAC 40"],
  },
  {
    symbol: "^N225",
    name: "Nikkei 225",
    region: "Japao",
    aliases: ["^N225", "Nikkei 225"],
  },
  {
    symbol: "^HSI",
    name: "Hang Seng",
    region: "Hong Kong",
    aliases: ["^HSI", "Hang Seng"],
  },
  {
    symbol: "000001.SS",
    name: "Shanghai Composite",
    region: "China",
    aliases: ["000001.SS", "SSE Composite Index", "Shanghai Composite"],
  },
  {
    symbol: "^BVSP",
    name: "Ibovespa",
    region: "Brasil",
    aliases: ["^BVSP", "Ibovespa", "IBOVESPA"],
  },
];

const fallbackMarkets = [
  {
    symbol: "^GSPC",
    name: "S&P 500",
    region: "Estados Unidos",
    price: 5234.61,
    change: 42.17,
    changePercent: 0.81,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^DJI",
    name: "Dow Jones",
    region: "Estados Unidos",
    price: 39211.24,
    change: 188.51,
    changePercent: 0.48,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^IXIC",
    name: "Nasdaq",
    region: "Estados Unidos",
    price: 16488.39,
    change: 136.42,
    changePercent: 0.83,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^FTSE",
    name: "FTSE 100",
    region: "Reino Unido",
    price: 7815.32,
    change: -21.44,
    changePercent: -0.27,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^GDAXI",
    name: "DAX",
    region: "Alemanha",
    price: 18202.13,
    change: 94.51,
    changePercent: 0.52,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^FCHI",
    name: "CAC 40",
    region: "Franca",
    price: 8084.17,
    change: 23.81,
    changePercent: 0.30,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^N225",
    name: "Nikkei 225",
    region: "Japao",
    price: 40102.55,
    change: -144.32,
    changePercent: -0.36,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^HSI",
    name: "Hang Seng",
    region: "Hong Kong",
    price: 16744.02,
    change: 121.62,
    changePercent: 0.73,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "000001.SS",
    name: "Shanghai Composite",
    region: "China",
    price: 3051.77,
    change: -8.11,
    changePercent: -0.27,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^BVSP",
    name: "Ibovespa",
    region: "Brasil",
    price: 127884.41,
    change: 961.33,
    changePercent: 0.76,
    updatedAt: "2026-03-22T13:15:00Z",
  },
];

function getFallbackMarkets() {
  return fallbackMarkets;
}

function buildFmpBatchIndexUrl(apiKey) {
  const params = new URLSearchParams({ apikey: apiKey });
  return `https://financialmodelingprep.com/stable/batch-index-quotes?${params.toString()}`;
}

function buildYahooChartUrl(symbol) {
  const encoded = encodeURIComponent(symbol);
  return `https://query1.finance.yahoo.com/v8/finance/chart/${encoded}?interval=1m&range=1d`;
}

async function fetchMarketOverviewFromFmp({ apiKey, fetchImpl }) {
  const response = await fetchImpl(buildFmpBatchIndexUrl(apiKey));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao consultar Financial Modeling Prep");
  }

  const payload = await response.json();
  const quotes = Array.isArray(payload) ? payload : [];

  return trackedIndices.map((indexConfig) => {
    const quote = findQuote(quotes, indexConfig.aliases);
    const fallback = fallbackMarkets.find((item) => item.symbol === indexConfig.symbol);

    if (!quote) {
      return fallback;
    }

    return {
      symbol: indexConfig.symbol,
      name: indexConfig.name,
      region: indexConfig.region,
      price: getFirstNumber(quote.price, quote.lastSalePrice, fallback?.price),
      change: getFirstNumber(quote.change, fallback?.change),
      changePercent: parsePercentage(
        quote.changesPercentage,
        quote.changePercentage,
        fallback?.changePercent
      ),
      updatedAt: normalizeTimestamp(quote.timestamp, fallback?.updatedAt),
    };
  });
}

async function fetchMarketOverviewFromYahoo({ fetchImpl }) {
  const responses = await Promise.all(
    trackedIndices.map(async (indexConfig) => {
      const fallback = fallbackMarkets.find((item) => item.symbol === indexConfig.symbol);

      try {
        const response = await fetchImpl(buildYahooChartUrl(indexConfig.symbol), {
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (!response.ok) {
          throw new Error(`Falha Yahoo para ${indexConfig.symbol}`);
        }

        const payload = await response.json();
        const result = payload?.chart?.result?.[0];
        const meta = result?.meta;

        if (!meta) {
          throw new Error(`Resposta incompleta para ${indexConfig.symbol}`);
        }

        const price = getFirstNumber(meta.regularMarketPrice, fallback?.price);
        const previousClose = getFirstNumber(meta.previousClose, meta.chartPreviousClose, price);
        const change = price - previousClose;
        const changePercent =
          previousClose && !Number.isNaN(previousClose) ? (change / previousClose) * 100 : 0;

        return {
          symbol: indexConfig.symbol,
          name: indexConfig.name,
          region: indexConfig.region,
          price,
          change,
          changePercent,
          updatedAt: normalizeTimestamp(meta.regularMarketTime, fallback?.updatedAt),
        };
      } catch (error) {
        return fallback;
      }
    })
  );

  return responses;
}

async function fetchMarketOverview({ apiKey, fetchImpl }) {
  if (apiKey) {
    try {
      return await fetchMarketOverviewFromFmp({ apiKey, fetchImpl });
    } catch (error) {
      return fetchMarketOverviewFromYahoo({ fetchImpl });
    }
  }

  return fetchMarketOverviewFromYahoo({ fetchImpl });
}

function findQuote(quotes, aliases) {
  return quotes.find((quote) => {
    const symbol = String(quote.symbol || "").toLowerCase();
    const name = String(quote.name || "").toLowerCase();

    return aliases.some((alias) => {
      const normalized = alias.toLowerCase();
      return symbol === normalized || name.includes(normalized);
    });
  });
}

function getFirstNumber(...values) {
  for (const value of values) {
    const parsed = Number(value);

    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return 0;
}

function parsePercentage(...values) {
  for (const value of values) {
    if (typeof value === "number" && !Number.isNaN(value)) {
      return value;
    }

    if (typeof value === "string") {
      const cleaned = value.replace(/[()%]/g, "").replace(",", ".").trim();
      const parsed = Number(cleaned);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return 0;
}

function normalizeTimestamp(timestamp, fallback) {
  if (typeof timestamp === "number") {
    const millis = timestamp > 9999999999 ? timestamp : timestamp * 1000;
    return new Date(millis).toISOString();
  }

  if (typeof timestamp === "string" && timestamp) {
    const date = new Date(timestamp);

    if (!Number.isNaN(date.getTime())) {
      return date.toISOString();
    }
  }

  return fallback || new Date().toISOString();
}

module.exports = {
  trackedIndices,
  getFallbackMarkets,
  fetchMarketOverview,
  fetchMarketOverviewFromFmp,
  fetchMarketOverviewFromYahoo,
};
