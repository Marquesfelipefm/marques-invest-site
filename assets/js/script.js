const sourceLabels = [
  "Bloomberg",
  "WSJ",
  "The Economist",
  "The Block",
  "Investing.com",
  "Reuters",
  "CNBC",
  "CoinDesk",
];

const fallbackMarkets = [
  {
    symbol: "^GSPC",
    name: "S&P 500",
    region: "Estados Unidos",
    price: 5234.61,
    change: 42.17,
    changePercent: 0.81,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^DJI",
    name: "Dow Jones",
    region: "Estados Unidos",
    price: 39211.24,
    change: 188.51,
    changePercent: 0.48,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^IXIC",
    name: "Nasdaq",
    region: "Estados Unidos",
    price: 16488.39,
    change: 136.42,
    changePercent: 0.83,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^FTSE",
    name: "FTSE 100",
    region: "Reino Unido",
    price: 7815.32,
    change: -21.44,
    changePercent: -0.27,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^GDAXI",
    name: "DAX",
    region: "Alemanha",
    price: 18202.13,
    change: 94.51,
    changePercent: 0.52,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^FCHI",
    name: "CAC 40",
    region: "Franca",
    price: 8084.17,
    change: 23.81,
    changePercent: 0.3,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^N225",
    name: "Nikkei 225",
    region: "Japao",
    price: 40102.55,
    change: -144.32,
    changePercent: -0.36,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^HSI",
    name: "Hang Seng",
    region: "Hong Kong",
    price: 16744.02,
    change: 121.62,
    changePercent: 0.73,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "000001.SS",
    name: "Shanghai Composite",
    region: "China",
    price: 3051.77,
    change: -8.11,
    changePercent: -0.27,
    updatedAt: "2026-03-22T13:15:00Z",
  },
  {
    symbol: "^BVSP",
    name: "Ibovespa",
    region: "Brasil",
    price: 127884.41,
    change: 961.33,
    changePercent: 0.76,
    updatedAt: "2026-03-22T13:15:00Z",
  },
];

const fallbackAgenda = [
  {
    title: "IPCA e leitura de inflacao",
    summary: "Atualizacao importante para expectativas de juros e consumo.",
    event_at: "2026-03-22T08:00:00Z",
    impact: "Alta",
    region: "Brasil",
  },
  {
    title: "Leilao do Tesouro",
    summary: "Indicador relevante para renda fixa e percepcao de risco.",
    event_at: "2026-03-22T14:00:00Z",
    impact: "Media",
    region: "Brasil",
  },
  {
    title: "Discurso de dirigente de banco central",
    summary: "Pode alterar projecoes para taxa basica e cambio.",
    event_at: "2026-03-22T16:30:00Z",
    impact: "Alta",
    region: "Global",
  },
];

const categoryDefinitions = {
  latest: { label: "Mais recentes" },
  markets: { label: "Mercado financeiro" },
  companies: { label: "Empresas" },
  crypto: { label: "Criptoativos" },
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
  {
    category: "companies",
    source: "The Economist",
    publishedAt: "2026-03-22T08:40:00Z",
    title: "Empresas globais revisam estrategia em ambiente de custo de capital elevado",
    description:
      "A alocacao de capital e a busca por eficiencia voltam ao foco em varios setores listados.",
    url: "#",
  },
  {
    category: "crypto",
    source: "CoinDesk",
    publishedAt: "2026-03-22T08:15:00Z",
    title: "Fluxo para ETFs e narrativas de tokenizacao movem o radar do mercado cripto",
    description:
      "Analistas acompanham novas teses para ativos digitais, stablecoins e infraestrutura blockchain.",
    url: "#",
  },
];

const newsGrid = document.querySelector("#news-grid");
const newsStatus = document.querySelector("#news-status");
const marketBoard = document.querySelector("#market-board");
const marketStatus = document.querySelector("#market-status");
const agendaList = document.querySelector("#agenda-list");
const filterButtons = document.querySelectorAll(".filter-button");
const newsletterForm = document.querySelector(".newsletter-form");
const contactForm = document.querySelector("#contact-form");
const contactStatus = document.querySelector("#contact-status");
const cepInput = document.querySelector("#cep");
const streetInput = document.querySelector("#street");
const districtInput = document.querySelector("#district");
const cityInput = document.querySelector("#city");
const stateInput = document.querySelector("#state");
const shareNetworks = [
  { key: "x", label: "X" },
  { key: "facebook", label: "Facebook" },
  { key: "instagram", label: "Instagram" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "youtube", label: "YouTube" },
];

let currentCategory = "latest";
let marketRefreshTimer;
let lastFetchedCep = "";

function slugify(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getShareIcon(network) {
  const icons = {
    x: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17.76 3H20.5l-5.98 6.84L21.56 21h-5.52l-4.32-5.65L6.78 21H4.03l6.39-7.3L3.63 3h5.66l3.91 5.17L17.76 3Z"></path>
      </svg>
    `,
    facebook: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M13.5 21v-7.02h2.36l.35-2.73H13.5V9.5c0-.79.22-1.32 1.35-1.32h1.44V5.73c-.25-.03-1.12-.11-2.13-.11-2.11 0-3.56 1.29-3.56 3.66v1.97H8.2v2.73h2.4V21h2.9Z"></path>
      </svg>
    `,
    instagram: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 1.8A2.7 2.7 0 0 0 4.8 7.5v9a2.7 2.7 0 0 0 2.7 2.7h9a2.7 2.7 0 0 0 2.7-2.7v-9a2.7 2.7 0 0 0-2.7-2.7h-9Zm9.45 1.35a1.05 1.05 0 1 1 0 2.1 1.05 1.05 0 0 1 0-2.1ZM12 7.8A4.2 4.2 0 1 1 7.8 12 4.2 4.2 0 0 1 12 7.8Zm0 1.8A2.4 2.4 0 1 0 14.4 12 2.4 2.4 0 0 0 12 9.6Z"></path>
      </svg>
    `,
    linkedin: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6.94 8.5H4V20h2.94V8.5ZM5.47 4A1.72 1.72 0 1 0 5.5 7.44 1.72 1.72 0 0 0 5.47 4ZM20 13.02C20 9.78 18.27 8.27 15.97 8.27a4 4 0 0 0-3.6 1.98V8.5H9.43V20h2.94v-6.4c0-1.69.32-3.33 2.42-3.33 2.07 0 2.1 1.94 2.1 3.44V20H20v-6.98Z"></path>
      </svg>
    `,
    youtube: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M21.58 7.19a2.94 2.94 0 0 0-2.07-2.08C17.7 4.6 12 4.6 12 4.6s-5.7 0-7.51.51A2.94 2.94 0 0 0 2.42 7.2 30.24 30.24 0 0 0 1.9 12a30.24 30.24 0 0 0 .52 4.81 2.94 2.94 0 0 0 2.07 2.08c1.81.51 7.51.51 7.51.51s5.7 0 7.51-.51a2.94 2.94 0 0 0 2.07-2.08A30.24 30.24 0 0 0 22.1 12a30.24 30.24 0 0 0-.52-4.81ZM10.2 15.13V8.87L15.4 12l-5.2 3.13Z"></path>
      </svg>
    `,
  };

  return icons[network] || "";
}

function getCategoryLabel(category) {
  return categoryDefinitions[category]?.label || "Noticias";
}

function formatPublishedAt(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Agora";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function formatEventTime(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMarketPrice(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "--";
  }

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(number);
}

function formatMarketPercent(value) {
  const number = Number(value);

  if (Number.isNaN(number)) {
    return "0,00%";
  }

  return `${number > 0 ? "+" : ""}${number.toFixed(2).replace(".", ",")}%`;
}

function setContactStatus(message, tone = "default") {
  if (!contactStatus) {
    return;
  }

  contactStatus.textContent = message;
  contactStatus.classList.remove("is-error", "is-success");

  if (tone === "error") {
    contactStatus.classList.add("is-error");
  }

  if (tone === "success") {
    contactStatus.classList.add("is-success");
  }
}

function getMarketTone(value) {
  const number = Number(value);

  if (number > 0) {
    return "is-up";
  }

  if (number < 0) {
    return "is-down";
  }

  return "is-flat";
}

function getArticleUrl(item) {
  if (item.url && item.url !== "#") {
    return item.url;
  }

  const baseUrl = window.location.href.split("#")[0];
  return `${baseUrl}#${slugify(item.title)}`;
}

function getShareLinks(item) {
  const articleUrl = encodeURIComponent(getArticleUrl(item));
  const articleTitle = encodeURIComponent(item.title);

  return {
    x: `https://twitter.com/intent/tweet?text=${articleTitle}&url=${articleUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}`,
  };
}

function renderShareButtons(item) {
  return shareNetworks
    .map((network) => {
      const shareLinks = getShareLinks(item);
      const href = shareLinks[network.key];

      if (href) {
        return `
          <a
            class="share-button"
            href="${href}"
            target="_blank"
            rel="noreferrer"
            aria-label="Compartilhar no ${network.label}"
            title="Compartilhar no ${network.label}"
          >
            ${getShareIcon(network.key)}
          </a>
        `;
      }

      return `
        <button
          class="share-button"
          type="button"
          data-share-copy="true"
          data-network="${network.label}"
          data-title="${item.title}"
          data-url="${getArticleUrl(item)}"
          aria-label="Copiar link para compartilhar no ${network.label}"
          title="Copiar link para compartilhar no ${network.label}"
        >
          ${getShareIcon(network.key)}
        </button>
      `;
    })
    .join("");
}

function getFallbackNews(category) {
  if (category === "latest") {
    return [...fallbackNews].sort(
      (left, right) => new Date(right.publishedAt) - new Date(left.publishedAt)
    );
  }

  return fallbackNews.filter((item) => item.category === category);
}

function normalizeNewsItems(items, activeCategory) {
  return items.map((item) => ({
    category: item.category || (activeCategory === "latest" ? "markets" : activeCategory),
    source: item.source || "Fonte do mercado",
    publishedAt: item.publishedAt || item.published_at || new Date().toISOString(),
    title: item.title || "Sem titulo",
    description: item.description || item.excerpt || "Conteudo indisponivel no momento.",
    url: item.url || item.external_url || "#",
  }));
}

function normalizePosts(items, activeCategory) {
  return items.map((item) => ({
    category: item.category || (activeCategory === "latest" ? "markets" : activeCategory),
    source: item.source || "Marques Invest",
    publishedAt: item.published_at || item.created_at || new Date().toISOString(),
    title: item.title || "Sem titulo",
    description: item.excerpt || item.content || "Conteudo indisponivel no momento.",
    url: item.external_url || `#${item.slug || slugify(item.title || "post")}`,
  }));
}

function renderEmptyState() {
  if (!newsGrid) {
    return;
  }

  newsGrid.innerHTML = `
    <article class="news-card news-card-empty">
      <h3>Sem noticias no momento</h3>
      <p>Tente outra categoria ou publique novos posts no painel.</p>
    </article>
  `;
}

function renderNews(items) {
  if (!newsGrid) {
    return;
  }

  if (!items.length) {
    renderEmptyState();
    return;
  }

  newsGrid.innerHTML = items
    .map(
      (item) => `
        <article class="news-card">
          <div class="news-meta">
            <span>${item.source}</span>
            <span>${formatPublishedAt(item.publishedAt)}</span>
          </div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="news-card-footer">
            <span class="news-category-chip">${getCategoryLabel(item.category)}</span>
            <a href="${item.url}" class="news-link" ${
              item.url !== "#" ? 'target="_blank" rel="noreferrer"' : ""
            }>
              Abrir noticia
            </a>
          </div>
          <div class="share-bar">
            <span class="share-label">Compartilhar</span>
            <div class="share-actions">
              ${renderShareButtons(item)}
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderAgenda(items) {
  if (!agendaList) {
    return;
  }

  agendaList.innerHTML = items
    .map(
      (item) => `
        <article class="agenda-item">
          <span class="agenda-date">${formatEventTime(item.event_at)}</span>
          <div>
            <h3>${item.title}</h3>
            <p>${item.summary}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function updateStatus(message, tone = "default") {
  if (!newsStatus) {
    return;
  }

  newsStatus.textContent = message;
  newsStatus.dataset.tone = tone;
}

function updateMarketStatus(message, tone = "default") {
  if (!marketStatus) {
    return;
  }

  marketStatus.textContent = message;
  marketStatus.dataset.tone = tone;
}

function renderMarketBoard(items) {
  if (!marketBoard) {
    return;
  }

  marketBoard.innerHTML = items
    .map(
      (item) => `
        <article class="market-item">
          <div class="market-item-header">
            <div>
              <strong class="market-item-name">${item.name}</strong>
              <span class="market-item-region">${item.region}</span>
            </div>
            <span class="market-item-change ${getMarketTone(item.changePercent)}">
              ${formatMarketPercent(item.changePercent)}
            </span>
          </div>
          <div class="market-item-footer">
            <span class="market-item-price">${formatMarketPrice(item.price)}</span>
            <span class="market-item-time">${formatPublishedAt(item.updatedAt)}</span>
          </div>
        </article>
      `
    )
    .join("");
}

async function fetchMarketOverview() {
  if (window.location.protocol === "file:") {
    throw new Error("Local file mode");
  }

  const endpoints = [
    `${window.location.origin}/api/market-overview`,
    `${window.location.origin}/.netlify/functions/market-overview`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        continue;
      }

      return response.json();
    } catch (error) {
      // Try the next endpoint.
    }
  }

  throw new Error("No market endpoint available");
}

async function loadMarketOverview() {
  updateMarketStatus("Atualizando bolsas globais em tempo real...", "loading");

  try {
    const payload = await fetchMarketOverview();
    const items = Array.isArray(payload.items) && payload.items.length ? payload.items : fallbackMarkets;
    renderMarketBoard(items);

    if (payload.mode === "live") {
      updateMarketStatus(
        "Painel global ao vivo com atualizacao automatica das principais bolsas.",
        "live"
      );
      return;
    }

    updateMarketStatus(
      payload.message ||
        "API de mercado ainda nao configurada. Exibindo panorama demonstrativo das bolsas.",
      "fallback"
    );
  } catch (error) {
    renderMarketBoard(fallbackMarkets);
    updateMarketStatus(
      "Preview local ativo. Configure a API de mercado no deploy para atualizar intraday.",
      "fallback"
    );
  }
}

function resetAddressFields() {
  if (!streetInput || !districtInput || !cityInput || !stateInput) {
    return;
  }

  streetInput.value = "";
  districtInput.value = "";
  cityInput.value = "";
  stateInput.value = "";
}

function formatCep(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

async function fetchCepData(cep) {
  const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

  if (!response.ok) {
    throw new Error("Falha na consulta do CEP");
  }

  const data = await response.json();

  if (data.erro) {
    throw new Error("CEP nao encontrado");
  }

  return data;
}

async function handleCepLookup() {
  if (!cepInput || !streetInput || !districtInput || !cityInput || !stateInput) {
    return;
  }

  const cep = cepInput.value.replace(/\D/g, "");

  if (cep.length < 8 || cep === lastFetchedCep) {
    return;
  }

  setContactStatus("Buscando endereco pelo CEP...", "default");

  try {
    const data = await fetchCepData(cep);
    streetInput.value = data.logradouro || "";
    districtInput.value = data.bairro || "";
    cityInput.value = data.localidade || "";
    stateInput.value = data.uf || "";
    lastFetchedCep = cep;
    setContactStatus(
      "Endereco preenchido automaticamente. Complete numero e complemento.",
      "success"
    );
  } catch (error) {
    lastFetchedCep = "";
    resetAddressFields();
    setContactStatus(
      "Nao foi possivel localizar esse CEP. Verifique os numeros digitados.",
      "error"
    );
  }
}

async function fetchNewsFromEndpoint(category) {
  if (window.location.protocol === "file:") {
    throw new Error("Local file mode");
  }

  const endpoints = [
    `${window.location.origin}/api/news?category=${category}`,
    `${window.location.origin}/.netlify/functions/news?category=${category}`,
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        continue;
      }

      return response.json();
    } catch (error) {
      // Try the next endpoint.
    }
  }

  throw new Error("No endpoint available");
}

async function loadNews(category) {
  currentCategory = category;
  updateStatus("Carregando noticias mais recentes das fontes configuradas...", "loading");

  if (window.MarquesSupabase?.isConfigured()) {
    try {
      const remotePosts = await window.MarquesSupabase.listPublicPosts(category);
      const normalizedPosts = normalizePosts(remotePosts || [], category);

      if (normalizedPosts.length) {
        renderNews(normalizedPosts);
        updateStatus(
          "Exibindo posts publicados pelo painel online do Supabase.",
          "live"
        );
        return;
      }
    } catch (error) {
      // Fall through to API/news fallback.
    }
  }

  try {
    const payload = await fetchNewsFromEndpoint(category);
    const items = normalizeNewsItems(payload.items || [], category);

    renderNews(items);

    if (payload.mode === "live") {
      updateStatus(
        `Fontes ativas: ${sourceLabels.join(", ")}. Exibindo ${getCategoryLabel(category).toLowerCase()}.`,
        "live"
      );
      return;
    }

    updateStatus(
      payload.message ||
        "API ainda nao configurada. Exibindo noticias de demonstracao para preview local.",
      "fallback"
    );
  } catch (error) {
    renderNews(getFallbackNews(category));
    updateStatus(
      "Preview local ativo. Configure a API ou publique posts no painel para carregar noticias reais.",
      "fallback"
    );
  }
}

async function loadAgendaEvents() {
  if (!agendaList) {
    return;
  }

  if (window.MarquesSupabase?.isConfigured()) {
    try {
      const events = await window.MarquesSupabase.listPublicAgenda();

      if (Array.isArray(events) && events.length) {
        renderAgenda(events);
        return;
      }
    } catch (error) {
      // Fall back to demo items.
    }
  }

  renderAgenda(fallbackAgenda);
}

if (filterButtons.length) {
  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      filterButtons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      loadNews(button.dataset.filter);
    });
  });
}

if (newsletterForm) {
  newsletterForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = newsletterForm.querySelector("input");
    const button = newsletterForm.querySelector("button");

    if (!input.value.trim()) {
      input.focus();
      return;
    }

    try {
      if (window.MarquesSupabase?.isConfigured()) {
        await window.MarquesSupabase.saveNewsletterSubscriber({
          email: input.value.trim(),
        });
      }

      button.textContent = "Inscrito com sucesso";
      button.disabled = true;
      input.disabled = true;
    } catch (error) {
      button.textContent = "Tente novamente";
    }
  });
}

if (cepInput) {
  cepInput.addEventListener("input", () => {
    cepInput.value = formatCep(cepInput.value);

    const digits = cepInput.value.replace(/\D/g, "");

    if (digits.length < 8) {
      lastFetchedCep = "";
      resetAddressFields();
      setContactStatus("Preencha o CEP para buscar automaticamente o endereco.");
      return;
    }

    handleCepLookup();
  });

  cepInput.addEventListener("blur", handleCepLookup);
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    await handleCepLookup();

    if (!streetInput.value || !cityInput.value || !stateInput.value) {
      setContactStatus(
        "Complete um CEP valido antes de enviar o cadastro.",
        "error"
      );
      cepInput.focus();
      return;
    }

    const submitButton = contactForm.querySelector(".contact-submit");
    const formData = new FormData(contactForm);

    try {
      if (window.MarquesSupabase?.isConfigured()) {
        await window.MarquesSupabase.saveContactLead({
          name: formData.get("name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          cep: formData.get("cep"),
          street: formData.get("street"),
          number: formData.get("number"),
          complement: formData.get("complement"),
          district: formData.get("district"),
          city: formData.get("city"),
          state: formData.get("state"),
          service: formData.get("service"),
          investmentRange: formData.get("investmentRange"),
        });
      }

      submitButton.textContent = "Cadastro enviado";
      submitButton.disabled = true;
      setContactStatus(
        "Cadastro registrado com sucesso. O painel online ja pode receber esse lead.",
        "success"
      );
    } catch (error) {
      setContactStatus(
        "Nao foi possivel enviar agora. Verifique a configuracao online do formulario.",
        "error"
      );
    }
  });
}

document.addEventListener("click", async (event) => {
  const shareButton = event.target.closest("[data-share-copy='true']");

  if (!shareButton) {
    return;
  }

  const title = shareButton.dataset.title;
  const url = shareButton.dataset.url;
  const network = shareButton.dataset.network;

  try {
    await navigator.clipboard.writeText(`${title} - ${url}`);
    shareButton.classList.add("is-copied");
    shareButton.setAttribute("title", `Link copiado para ${network}`);

    setTimeout(() => {
      shareButton.classList.remove("is-copied");
      shareButton.setAttribute("title", `Copiar link para compartilhar no ${network}`);
    }, 1800);
  } catch (error) {
    window.prompt(`Copie o link para compartilhar no ${network}:`, `${title} - ${url}`);
  }
});

if (marketBoard) {
  renderMarketBoard(fallbackMarkets);
  loadMarketOverview();
  clearInterval(marketRefreshTimer);
  marketRefreshTimer = setInterval(loadMarketOverview, 60000);
}

if (newsGrid) {
  renderNews(getFallbackNews(currentCategory));
  loadNews(currentCategory);
}

if (agendaList) {
  loadAgendaEvents();
}
