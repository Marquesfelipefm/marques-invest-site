const { fetchBirdeyeTxs } = require("../../server/birdeye-service");

exports.handler = async function handler(event) {
    const apiKey = process.env.BIRDEYE_API_KEY;
    const params = event.queryStringParameters || {};

    try {
          const items = await fetchBirdeyeTxs({
                  apiKey,
                  address: params.address,
                  chain: params.chain,
                  offset: params.offset,
                  limit: params.limit,
                  txType: params.tx_type,
                  sortType: params.sort_type,
                  fetchImpl: fetch,
          });

      return {
              statusCode: 200,
              headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=10" },
              body: JSON.stringify({ mode: "live", items }),
      };
    } catch (error) {
          return {
                  statusCode: 200,
                  headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=5" },
                  body: JSON.stringify({ mode: "error", message: error.message, items: [] }),
          };
    }
};
