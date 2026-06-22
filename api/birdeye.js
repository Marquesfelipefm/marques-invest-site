const { fetchBirdeyeTxs } = require("../server/birdeye-service");

module.exports = async function handler(req, res) {
    const apiKey = process.env.BIRDEYE_API_KEY;

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "s-maxage=10, stale-while-revalidate=20");

    const { address, chain, offset, limit, tx_type, sort_type } = req.query || {};

    try {
          const items = await fetchBirdeyeTxs({
                  apiKey,
                  address,
                  chain,
                  offset,
                  limit,
                  txType: tx_type,
                  sortType: sort_type,
                  fetchImpl: fetch,
          });

      res.status(200).json({ mode: "live", items });
    } catch (error) {
          res.status(200).json({ mode: "error", message: error.message, items: [] });
    }
};
