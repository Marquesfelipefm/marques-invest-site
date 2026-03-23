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
        "NEWSAPI_KEY nao configurada no deploy. Exibindo noticias demonstrativas ate a API ser conectada.",
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
        "A API de noticias falhou temporariamente. O site entrou em modo seguro com conteudo de demonstracao.",
      error: error.message,
      items: getFallbackNews(category),
    });
  }
};
