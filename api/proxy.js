const { fetchViaProxy } = require("../server/proxy-service");

module.exports = async function handler(req, res) {
  const { url } = req.query || {};

  try {
    const { status, text, contentType } = await fetchViaProxy({ url, fetchImpl: fetch });
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");
    res.status(status).send(text);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
