const {
  trackedIndices,
  getFallbackMarkets,
  fetchMarketOverview,
} = require("../server/market-service");

module.exports = async function handler(req, res) {
  const apiKey = process.env.FMP_API_KEY;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  try {
    const items = await fetchMarketOverview({
      apiKey,
      fetchImpl: fetch,
    });

    res.status(200).json({
      mode: "live",
      tracked: trackedIndices,
      provider: apiKey ? "fmp" : "yahoo",
      items,
    });
  } catch (error) {
    res.status(200).json({
      mode: "fallback",
      tracked: trackedIndices,
      message:
        "Atualizacao ao vivo temporariamente indisponivel. Exibindo panorama de referencia das bolsas.",
      error: error.message,
      items: getFallbackMarkets(),
    });
  }
};
