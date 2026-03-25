const {
  sourceDomains,
  getFallbackNews,
  fetchNews,
} = require("../server/news-service");

module.exports = async function handler(req, res) {
  const category = req.query.category || "latest";
  const marketauxApiKey = process.env.MARKETAUX_API_KEY;
  const newsApiKey = process.env.NEWSAPI_KEY;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    const { items, provider } = await fetchNews({
      marketauxApiKey,
      newsApiKey,
      category,
      fetchImpl: fetch,
    });

    res.status(200).json({
      mode: "live",
      category,
      sources: sourceDomains,
      provider,
      items,
    });
  } catch (error) {
    res.status(200).json({
      mode: "fallback",
      category,
      sources: sourceDomains,
      message:
        "Atualizacao automatica temporariamente indisponivel. Exibindo noticias de referencia.",
      error: error.message,
      items: getFallbackNews(category),
    });
  }
};
