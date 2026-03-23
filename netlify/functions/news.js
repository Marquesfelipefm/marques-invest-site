const {
  sourceDomains,
  getFallbackNews,
  fetchNews,
} = require("../../server/news-service");

exports.handler = async function handler(event) {
  const category = event.queryStringParameters?.category || "latest";
  const apiKey = process.env.NEWSAPI_KEY;

  try {
    const items = await fetchNews({
      apiKey,
      category,
      fetchImpl: fetch,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify({
        mode: "live",
        category,
        sources: sourceDomains,
        provider: apiKey ? "newsapi" : "rss",
        items,
      }),
    };
  } catch (error) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=60",
      },
      body: JSON.stringify({
        mode: "fallback",
        category,
        sources: sourceDomains,
        message:
          "Atualizacao automatica temporariamente indisponivel. Exibindo noticias de referencia.",
        error: error.message,
        items: getFallbackNews(category),
      }),
    };
  }
};
