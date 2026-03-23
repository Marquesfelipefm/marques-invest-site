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
          "Panorama de referencia exibido no momento. A atualizacao ao vivo das bolsas sera habilitada em breve.",
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
          "Atualizacao ao vivo temporariamente indisponivel. Exibindo panorama de referencia das bolsas.",
        error: error.message,
        items: getFallbackMarkets(),
      }),
    };
  }
};
