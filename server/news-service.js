const sourceDomains = [
  "bloomberg.com",
  "wsj.com",
  "economist.com",
  "theblock.co",
  "investing.com",
  "reuters.com",
  "cnbc.com",
  "coindesk.com",
];

const categoryQueries = {
  latest:
    '(markets OR stocks OR "financial market" OR company OR earnings OR crypto OR bitcoin OR ethereum)',
  markets:
    '(markets OR stocks OR bonds OR rates OR inflation OR forex OR central bank OR "financial market")',
  companies:
    '(company OR companies OR earnings OR merger OR acquisition OR IPO OR CEO OR business results)',
  crypto:
    '(crypto OR bitcoin OR ethereum OR blockchain OR token OR stablecoin OR digital assets)',
};

const fallbackNews = [
  {
    category: "markets",
    source: "Bloomberg",
    publishedAt: "2026-03-22T12:10:00Z",
    title: "Mercados reavaliam juros globais apos nova rodada de dados macro",
    description:
      "Investidores acompanham a curva de juros e o impacto sobre bolsas, moedas e renda fixa.",
    url: "#",
  },
  {
    category: "companies",
    source: "WSJ",
    publishedAt: "2026-03-22T11:20:00Z",
    title: "Temporada de resultados recoloca grandes empresas no centro do fluxo",
    description:
      "Companhias com caixa forte e margem resiliente voltam a liderar a conversa no mercado.",
    url: "#",
  },
  {
    category: "crypto",
    source: "The Block",
    publishedAt: "2026-03-22T10:35:00Z",
    title: "Bitcoin e Ethereum operam com volatilidade em sessao de maior sensibilidade",
    description:
      "Criptoativos reagem a juros, liquidez global e movimento institucional em plataformas digitais.",
    url: "#",
  },
  {
    category: "markets",
    source: "Reuters",
    publishedAt: "2026-03-22T09:55:00Z",
    title: "Dolar, bolsas e Treasuries ajustam precos com foco em politica monetaria",
    description:
      "O mercado financeiro monitora sinais de bancos centrais e novos vetores para o risco global.",
    url: "#",
  },
];

function normalizeCategory(category) {
  return categoryQueries[category] ? category : "latest";
}

function getFallbackNews(category) {
  const safeCategory = normalizeCategory(category);

  if (safeCategory === "latest") {
    return [...fallbackNews].sort(
      (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt)
    );
  }

  return fallbackNews.filter((item) => item.category === safeCategory);
}

function buildNewsApiUrl(apiKey, category) {
  const safeCategory = normalizeCategory(category);
  const params = new URLSearchParams({
    q: categoryQueries[safeCategory],
    domains: sourceDomains.join(","),
    sortBy: "publishedAt",
    pageSize: "18",
    language: "en",
    apiKey,
  });

  return `https://newsapi.org/v2/everything?${params.toString()}`;
}

async function fetchNewsFromNewsApi({ apiKey, category, fetchImpl }) {
  const safeCategory = normalizeCategory(category);
  const response = await fetchImpl(buildNewsApiUrl(apiKey, safeCategory));

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Falha ao consultar NewsAPI");
  }

  const payload = await response.json();

  return (payload.articles || [])
    .filter((article) => article.title && article.title !== "[Removed]")
    .map((article) => ({
      category: safeCategory === "latest" ? inferCategory(article) : safeCategory,
      source: article.source?.name || getSourceHostname(article.url),
      publishedAt: article.publishedAt,
      title: article.title,
      description: article.description || article.content || "Sem descricao disponivel.",
      url: article.url,
    }));
}

function getSourceHostname(url) {
  try {
    return new URL(url).hostname;
  } catch (error) {
    return "Fonte externa";
  }
}

function inferCategory(article) {
  const text = `${article.title || ""} ${article.description || ""}`.toLowerCase();

  if (
    text.includes("bitcoin") ||
    text.includes("crypto") ||
    text.includes("ethereum") ||
    text.includes("blockchain") ||
    text.includes("token")
  ) {
    return "crypto";
  }

  if (
    text.includes("earnings") ||
    text.includes("company") ||
    text.includes("companies") ||
    text.includes("ipo") ||
    text.includes("merger") ||
    text.includes("acquisition")
  ) {
    return "companies";
  }

  return "markets";
}

module.exports = {
  sourceDomains,
  getFallbackNews,
  fetchNewsFromNewsApi,
};
