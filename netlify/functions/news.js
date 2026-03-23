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
          "Noticias de referencia exibidas no momento. A atualizacao automatica sera habilitada em breve.",
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
          "Atualizacao automatica temporariamente indisponivel. Exibindo noticias de referencia.",
        error: error.message,
        items: getFallbackNews(category),
      }),
    };
  }
};
