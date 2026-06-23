function buildBirdeyeTxsUrl({ address, offset = 0, limit = 20, txType = "swap", sortType = "desc" }) {
    const params = new URLSearchParams({
          address,
          offset: String(offset),
          limit: String(limit),
          tx_type: txType,
          sort_type: sortType,
    });
    return `https://public-api.birdeye.so/defi/txs/token?${params.toString()}`;
}

async function fetchBirdeyeTxs({ apiKey, address, chain, offset, limit, txType, sortType, fetchImpl }) {
    if (!apiKey) {
          throw new Error("BIRDEYE_API_KEY nao configurada no servidor");
    }
    if (!address || !chain) {
          throw new Error("Parametros address/chain obrigatorios");
    }

  const response = await fetchImpl(buildBirdeyeTxsUrl({ address, offset, limit, txType, sortType }), {
        headers: {
                "X-API-KEY": apiKey,
                "x-chain": chain,
                accept: "application/json",
        },
        cache: "no-store",
  });

  if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Birdeye HTTP ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }

  const payload = await response.json();
    const items = payload?.data?.items;

  if (!Array.isArray(items)) {
        throw new Error("Payload inesperado da Birdeye");
  }

  return items;
}

module.exports = { fetchBirdeyeTxs, buildBirdeyeTxsUrl };
