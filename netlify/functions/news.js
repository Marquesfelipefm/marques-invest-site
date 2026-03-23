const {
  sourceDomains,
  getFallbackNews,
  fetchNewsFromNewsApi,
} = require("../../server/news-service");

exports.handler = async function handler(event) {
  const category = event.queryStringParameters?.category || "latest";
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify({
        mode: "fallback",
        category,
        sources: sourceDomains,
        message:
          "NEWSAPI_KEY nao configurada no deploy. Exibindo noticias demonstrativas ate a API ser conectada.",
        items: getFallbackNews(category),
      }),
    };
  }

  try {
    const items = await fetchNewsFromNewsApi({
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
          "A API de noticias falhou temporariamente. O site entrou em modo seguro com conteudo de demonstracao.",
        error: error.message,
        items: getFallbackNews(category),
      }),
    };
  }
};
