const {
  trackedIndices,
  getFallbackMarkets,
  fetchMarketOverviewFromFmp,
} = require("../../server/market-service");

exports.handler = async function handler() {
  const apiKey = process.env.FMP_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
      body: JSON.stringify({
        mode: "fallback",
        tracked: trackedIndices,
        message:
          "FMP_API_KEY nao configurada no deploy. Exibindo panorama demonstrativo das bolsas.",
        items: getFallbackMarkets(),
      }),
    };
  }

  try {
    const items = await fetchMarketOverviewFromFmp({
      apiKey,
      fetchImpl: fetch,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
      body: JSON.stringify({
        mode: "live",
        tracked: trackedIndices,
        items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=30",
      },
      body: JSON.stringify({
        mode: "fallback",
        tracked: trackedIndices,
        message:
          "A API de mercado falhou temporariamente. O painel entrou em modo seguro com dados demonstrativos.",
        error: error.message,
        items: getFallbackMarkets(),
      }),
    };
  }
};
