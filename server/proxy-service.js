const ALLOWED_HOSTS = new Set([
  "api.coingecko.com",
  "query1.finance.yahoo.com",
  "query2.finance.yahoo.com",
]);

async function fetchViaProxy({ url, fetchImpl }) {
  if (!url) {
    throw new Error("Parametro url obrigatorio");
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("URL invalida");
  }

  if (parsed.protocol !== "https:") {
    throw new Error("Apenas https permitido");
  }
  if (!ALLOWED_HOSTS.has(parsed.hostname)) {
    throw new Error("Host nao permitido: " + parsed.hostname);
  }

  const response = await fetchImpl(parsed.toString(), {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  const text = await response.text();

  return {
    status: response.status,
    text,
    contentType: response.headers.get("content-type") || "application/json",
  };
}

module.exports = { fetchViaProxy, ALLOWED_HOSTS };
