const { fetchViaProxy } = require("../../server/proxy-service");

exports.handler = async function handler(event) {
  const params = event.queryStringParameters || {};

  try {
    const { status, text, contentType } = await fetchViaProxy({ url: params.url, fetchImpl: fetch });
    return {
      statusCode: status,
      headers: { "Content-Type": contentType, "Cache-Control": "public, max-age=10" },
      body: text,
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: error.message }),
    };
  }
};
