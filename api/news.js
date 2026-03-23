const {
  sourceDomains,
  getFallbackNews,
  fetchNews,
} = require("../server/news-service");

module.exports = async function handler(req, res) {
  const category = req.query.category || "latest";
  const apiKey = process.env.NEWSAPI_KEY;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  try {
    const items = await fetchNews({
      apiKey,
      category,
      fetchImpl: fetch,
    });

    res.status(200).json({
      mode: "live",
      category,
      sources: sourceDomains,
      provider: apiKey ? "newsapi" : "rss",
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
