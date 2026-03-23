const {
  sourceDomains,
  getFallbackNews,
  fetchNewsFromNewsApi,
} = require("../server/news-service");

module.exports = async function handler(req, res) {
  const category = req.query.category || "latest";
  const apiKey = process.env.NEWSAPI_KEY;

  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");

  if (!apiKey) {
    res.status(200).json({
      mode: "fallback",
      category,
      sources: sourceDomains,
      message:
        "Noticias de referencia exibidas no momento. A atualizacao automatica sera habilitada em breve.",
      items: getFallbackNews(category),
    });
    return;
  }

  try {
    const items = await fetchNewsFromNewsApi({
      apiKey,
      category,
      fetchImpl: fetch,
    });

    res.status(200).json({
      mode: "live",
      category,
      sources: sourceDomains,
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
