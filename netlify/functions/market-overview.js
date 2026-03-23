const {
  trackedIndices,
  getFallbackMarkets,
  fetchMarketOverview,
} = require("../../server/market-service");

exports.handler = async function handler() {
  const apiKey = process.env.FMP_API_KEY;

  try {
    const items = await fetchMarketOverview({
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
        provider: apiKey ? "fmp" : "yahoo",
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
          "Atualizacao ao vivo temporariamente indisponivel. Exibindo panorama de referencia das bolsas.",
        error: error.message,
        items: getFallbackMarkets(),
      }),
    };
  }
};
