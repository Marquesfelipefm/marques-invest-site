const sourceDomains = [
  "cnbc.com",
  "marketwatch.com",
  "investing.com",
];

const categoryFeeds = {
  latest: [
    {
      source: "CNBC",
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    },
    {
      source: "MarketWatch",
      url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    },
    {
      source: "Investing.com",
      url: "https://www.investing.com/rss/news_301.rss",
    },
  ],
  markets: [
    {
      source: "CNBC",
      url: "https://www.cnbc.com/id/100003114/device/rss/rss.html",
    },
    {
      source: "MarketWatch",
      url: "https://feeds.marketwatch.com/marketwatch/topstories/",
    },
  ],
  companies: [
    {
      source: "CNBC",
      url: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    },
  ],
  crypto: [
    {
      source: "Investing.com",
      url: "https://www.investing.com/rss/news_301.rss",
    },
  ],
};

const categoryQueries = {
  latest:
    '(markets OR stocks OR "financial market" OR company OR earnings OR crypto OR bitcoin OR ethereum)',
  markets:
    '(markets OR stocks OR bonds OR rates OR inflation OR forex OR central bank OR "financial market")',
  companies:
    '(company OR companies OR earnings OR merger OR acquisition OR IPO OR CEO OR business results)',
  crypto:
    '(crypto OR bitcoin OR ethereum OR blockchain OR token OR stablecoin OR digital assets)',
};

const fallbackNews = [
  {
    category: "markets",
    source: "Bloomberg",
    publishedAt: "2026-03-22T12:10:00Z",
    title: "Mercados reavaliam juros globais apos nova rodada de dados macro",
    description:
      "Investidores acompanham a curva de juros e o impacto sobre bolsas, moedas e renda fixa.",
    url: "#",
  },
  {
    category: "companies",
    source: "WSJ",
    publishedAt: "2026-03-22T11:20:00Z",
    title: "Temporada de resultados recoloca grandes empresas no centro do fluxo",
    description:
      "Companhias com caixa forte e margem resiliente voltam a liderar a conversa no mercado.",
    url: "#",
  },
  {
    category: "crypto",
    source: "The Block",
    publishedAt: "2026-03-22T10:35:00Z",
    title: "Bitcoin e Ethereum operam com volatilidade em sessao de maior sensibilidade",
    description:
      "Criptoativos reagem a juros, liquidez global e movimento institucional em plataformas digitais.",
    url: "#",
  },
  {
    category: "markets",
    source: "Reuters",
    publishedAt: "2026-03-22T09:55:00Z",
    title: "Dolar, bolsas e Treasuries ajustam precos com foco em politica monetaria",
    description:
      "O mercado financeiro monitora sinais de bancos centrais e novos vetores para o risco global.",
    url: "#",
  },
];

const categoryKeywords = {
  markets: [
    "market",
    "markets",
    "stock",
    "stocks",
    "bond",
    "bonds",
    "oil",
    "gold",
    "silver",
    "inflation",
    "rates",
    "interest rate",
    "fed",
    "central bank",
    "treasury",
    "forex",
    "dollar",
    "wall street",
    "nasdaq",
    "dow",
    "s&p",
    "investor",
    "investors",
    "trading",
    "futures",
    "rally",
    "crude",
    "economy",
    "economic",
  ],
  companies: [
    "company",
    "companies",
    "earnings",
    "revenue",
    "profit",
    "results",
    "guidance",
    "analyst",
    "ceo",
    "ipo",
    "merger",
    "acquisition",
    "shares",
    "stock rises",
    "stock falls",
    "business",
    "firm",
    "corporate",
    "vaccine",
    "apple",
    "tesla",
    "microsoft",
    "amazon",
    "meta",
    "nvidia",
    "pfizer",
    "blackrock",
    "chevron",
  ],
  crypto: [
    "bitcoin",
    "crypto",
    "ethereum",
    "blockchain",
    "token",
    "stablecoin",
    "digital asset",
    "digital assets",
    "solana",
    "etf",
    "defi",
  ],
};

function normalizeCategory(category) {
  return categoryFeeds[category] ? category : "latest";
}

function getFallbackNews(category) {
  const safeCategory = normalizeCategory(category);

  if (safeCategory === "latest") {
    return [...fallbackNews].sort(
      (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt)
    );
  }

  return fallbackNews.filter((item) => item.category === safeCategory);
}

function buildNewsApiUrl(apiKey, category) {
  const safeCategory = normalizeCategory(category);
  const params = new URLSearchParams({
    q: categoryQueries[safeCategory],
    domains: sourceDomains.join(","),
    sortBy: "publishedAt",
    pageSize: "18",
    language: "en",
    apiKey,
  });

  return `https://newsapi.org/v2/everything?${params.toString()}`;
}

async function fetchNewsFromNewsApi({ apiKey, category, fetchImpl }) {
  const safeCategory = normalizeCategory(category);
  const response = await fetchImpl(buildNewsApiUrl(apiKey, safeCategory));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao consultar NewsAPI");
  }

  const payload = await response.json();

  return (payload.articles || [])
    .filter((article) => article.title && article.title !== "[Removed]")
    .map((article) => {
      const inferredCategory = safeCategory === "latest" ? inferCategory(article) : safeCategory;

      if (inferredCategory === "other" || !isRelevantToCategory(article, inferredCategory)) {
        return null;
      }

      return {
        category: inferredCategory,
        source: article.source?.name || getSourceHostname(article.url),
        publishedAt: article.publishedAt,
        title: article.title,
        description: article.description || article.content || "Sem descricao disponivel.",
        url: article.url,
      };
    })
    .filter(Boolean);
}

async function fetchNewsFromRss({ category, fetchImpl }) {
  const safeCategory = normalizeCategory(category);
  const feeds = categoryFeeds[safeCategory] || categoryFeeds.latest;

  const collections = await Promise.all(
    feeds.map(async (feed) => {
      try {
        const response = await fetchImpl(feed.url, {
          headers: {
            Accept: "application/rss+xml, application/xml, text/xml",
            "User-Agent": "Mozilla/5.0",
          },
        });

        if (!response.ok) {
          throw new Error(`Falha no feed ${feed.source}`);
        }

        const xml = await response.text();
        return parseRssFeed(xml, feed.source, safeCategory);
      } catch (error) {
        return [];
      }
    })
  );

  return dedupeNewsItems(collections.flat())
    .sort((left, right) => new Date(right.publishedAt) - new Date(left.publishedAt))
    .slice(0, 18);
}

async function fetchNews({ apiKey, category, fetchImpl }) {
  if (apiKey) {
    try {
      return await fetchNewsFromNewsApi({ apiKey, category, fetchImpl });
    } catch (error) {
      return fetchNewsFromRss({ category, fetchImpl });
    }
  }

  return fetchNewsFromRss({ category, fetchImpl });
}

function parseRssFeed(xml, source, category) {
  const items = [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)];

  return items
    .map((match) => buildNewsItemFromRss(match[1], source, category))
    .filter(Boolean);
}

function buildNewsItemFromRss(rawItem, source, category) {
  const title = cleanText(extractTag(rawItem, "title"));
  const link = cleanText(extractTag(rawItem, "link"));
  const description = cleanText(
    extractTag(rawItem, "description") || extractTag(rawItem, "content:encoded")
  );
  const pubDate = normalizePublishedAt(extractTag(rawItem, "pubDate"));

  if (!title || !link) {
    return null;
  }

  const inferredCategory =
    category === "latest" ? inferCategory({ title, description }) : category;

  if (inferredCategory === "other") {
    return null;
  }

  if (!isRelevantToCategory({ title, description }, inferredCategory)) {
    return null;
  }

  return {
    category: inferredCategory,
    source,
    publishedAt: pubDate,
    title,
    description: description || "Sem descricao disponivel.",
    url: link,
  };
}

function extractTag(xml, tagName) {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`<${escaped}\\b[^>]*>([\\s\\S]*?)<\\/${escaped}>`, "i");
  return regex.exec(xml)?.[1]?.trim() || "";
}

function cleanText(value) {
  return decodeHtmlEntities(stripHtml(stripCdata(value || ""))).replace(/\s+/g, " ").trim();
}

function stripCdata(value) {
  return value.replace(/^<!\[CDATA\[/, "").replace(/\]\]>$/, "");
}

function stripHtml(value) {
  return value.replace(/<[^>]+>/g, " ");
}

function decodeHtmlEntities(value) {
  return value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function normalizePublishedAt(value) {
  const date = new Date(value);

  if (!Number.isNaN(date.getTime())) {
    return date.toISOString();
  }

  return new Date().toISOString();
}

function dedupeNewsItems(items) {
  const seen = new Set();

  return items.filter((item) => {
    const key = item.url || item.title;

    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}

function getSourceHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return "Fonte externa";
  }
}

function inferCategory(article) {
  const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();

  if (matchesKeywords(text, categoryKeywords.crypto)) {
    return "crypto";
  }

  if (matchesKeywords(text, categoryKeywords.companies)) {
    return "companies";
  }

  if (matchesKeywords(text, categoryKeywords.markets)) {
    return "markets";
  }

  return "other";
}

function isRelevantToCategory(article, category) {
  const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();
  const keywords = categoryKeywords[category];

  if (!keywords) {
    return false;
  }

  return matchesKeywords(text, keywords);
}

function matchesKeywords(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

module.exports = {
  sourceDomains,
  getFallbackNews,
  fetchNews,
  fetchNewsFromNewsApi,
  fetchNewsFromRss,
};
