const {
  trackedIndices,
  getFallbackMarkets,
  fetchMarketOverviewFromFmp,
} = require("../server/market-service");

module.exports = async function handler(req, res) {
  const apiKey = process.env.FMP_API_KEY;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=120");

  if (!apiKey) {
    res.status(200).json({
      mode: "fallback",
      tracked: trackedIndices,
      message:
        "FMP_API_KEY nao configurada no deploy. Exibindo panorama demonstrativo das bolsas.",
      items: getFallbackMarkets(),
    });
    return;
  }

  try {
    const items = await fetchMarketOverviewFromFmp({
      apiKey,
      fetchImpl: fetch,
    });

    res.status(200).json({
      mode: "live",
      tracked: trackedIndices,
      items,
    });
  } catch (error) {
    res.status(200).json({
      mode: "fallback",
      tracked: trackedIndices,
      message:
        "A API de mercado falhou temporariamente. O painel entrou em modo seguro com dados demonstrativos.",
      error: error.message,
      items: getFallbackMarkets(),
    });
  }
};
