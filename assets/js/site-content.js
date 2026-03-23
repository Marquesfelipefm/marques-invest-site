(function () {
  const STORAGE_KEY = "marques-invest-content";

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function loadLocalContent() {
    const defaults = clone(window.MARQUES_DEFAULT_CONTENT || {});

    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

      if (!saved) {
        return defaults;
      }

      return merge(defaults, saved);
    } catch (error) {
      return defaults;
    }
  }

  function merge(target, source) {
    if (!source || typeof source !== "object") {
      return target;
    }

    Object.keys(source).forEach((key) => {
      const sourceValue = source[key];

      if (Array.isArray(sourceValue)) {
        target[key] = sourceValue;
        return;
      }

      if (sourceValue && typeof sourceValue === "object") {
        target[key] = merge(target[key] || {}, sourceValue);
        return;
      }

      target[key] = sourceValue;
    });

    return target;
  }

  function saveContent(content) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(content));
  }

  function resetContent() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function setText(id, value) {
    const element = document.querySelector(id);

    if (element && typeof value === "string") {
      element.textContent = value;
    }
  }

  function applyWhatsAppLink(content) {
    const link = content.settings?.whatsappLink || "#";
    document.querySelectorAll(".whatsapp-float").forEach((item) => {
      item.href = link;
    });
  }

  function renderList(selector, items) {
    const element = document.querySelector(selector);

    if (!element || !Array.isArray(items)) {
      return;
    }

    element.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function getHomePreviewPoints(item) {
    const pointsByLink = {
      "analise-semana.html": [
        "Leitura estrategica da semana",
        "Cenarios para juros, bolsa e cambio",
        "Teses para carteira e posicionamento",
      ],
      "destaques.html": [
        "Cards editoriais com visual premium",
        "Materia principal em evidencia",
        "Chamadas para conteudos-chave",
      ],
      "noticias.html": [
        "Mais recentes, mercado, empresas e cripto",
        "Fontes conectadas e atualizacao continua",
        "Compartilhamento por rede social",
      ],
      "agenda.html": [
        "Eventos macro que movem o mercado",
        "Horarios e impacto esperado",
        "Leitura rapida para o dia",
      ],
      "newsletter.html": [
        "Captacao de leads e relacionamento",
        "Resumo do mercado no fechamento",
        "Estrutura pronta para automacao",
      ],
      "contato.html": [
        "Formulario comercial completo",
        "CEP com preenchimento automatico",
        "Triagem entre investimento e empresa",
      ],
    };

    return pointsByLink[item.link] || [
      "Conteudo editorial premium",
      "Leitura objetiva e rapida",
      "CTA para aprofundar na pagina",
    ];
  }

  function renderHome(content) {
    setText("#home-eyebrow", content.home.eyebrow);
    setText("#home-title", content.home.title);
    setText("#home-description", content.home.description);
    setText("#home-teaser-title", content.home.teaserTitle);

    const grid = document.querySelector("#home-teasers");

    if (!grid) {
      return;
    }

    grid.innerHTML = content.home.teasers
      .map(
        (item) => `
          <article class="teaser-card teaser-card--rich">
            <div class="teaser-card-top">
              <span class="tag">${item.tag}</span>
              <span class="teaser-meta">Previa da pagina</span>
            </div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <ul class="teaser-points">
              ${getHomePreviewPoints(item)
                .map((point) => `<li>${point}</li>`)
                .join("")}
            </ul>
            <a class="teaser-card-link" href="${item.link}">Abrir pagina</a>
          </article>
        `
      )
      .join("");
  }

  function renderAnalysis(content) {
    setText("#analysis-eyebrow", content.analysis.eyebrow);
    setText("#analysis-title", content.analysis.title);
    setText("#analysis-description", content.analysis.description);
    setText("#analysis-side-tag", content.analysis.sideTag);
    setText("#analysis-side-title", content.analysis.sideTitle);
    renderList("#analysis-bullets", content.analysis.bullets);
  }

  function renderHighlights(content) {
    setText("#highlights-kicker", content.highlights.kicker);
    setText("#highlights-title", content.highlights.title);
    const grid = document.querySelector("#highlights-grid");

    if (!grid) {
      return;
    }

    grid.innerHTML = content.highlights.cards
      .map(
        (item, index) => `
          <article class="feature ${index === 0 ? "feature-main" : ""}">
            <span class="tag">${item.tag}</span>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            ${
              index === 0
                ? '<a class="feature-link" href="analise-semana.html">Ir para analise da semana</a>'
                : ""
            }
          </article>
        `
      )
      .join("");
  }

  function renderNewsletter(content) {
    setText("#newsletter-kicker", content.newsletter.kicker);
    setText("#newsletter-title", content.newsletter.title);
    setText("#newsletter-description", content.newsletter.description);
    setText("#newsletter-button-label", content.newsletter.buttonLabel);
  }

  function renderContact(content) {
    setText("#contact-kicker", content.contact.kicker);
    setText("#contact-title", content.contact.title);
    setText("#contact-tag", content.contact.tag);
    setText("#contact-heading", content.contact.heading);
    setText("#contact-description", content.contact.description);
    renderList("#contact-benefits", content.contact.benefits);
  }

  async function loadContent() {
    const localContent = loadLocalContent();

    if (!window.MarquesSupabase?.isConfigured()) {
      return localContent;
    }

    try {
      const remoteContent = await window.MarquesSupabase.loadSiteSnapshot();
      return merge(localContent, remoteContent);
    } catch (error) {
      return localContent;
    }
  }

  async function applyContent() {
    const content = await loadContent();
    applyWhatsAppLink(content);

    const page = document.body.dataset.page;

    if (page === "home") {
      renderHome(content);
    }

    if (page === "analysis") {
      renderAnalysis(content);
    }

    if (page === "highlights") {
      renderHighlights(content);
    }

    if (page === "newsletter") {
      renderNewsletter(content);
    }

    if (page === "contact") {
      renderContact(content);
    }
  }

  window.MarquesContentStore = {
    load: loadLocalContent,
    save: saveContent,
    reset: resetContent,
    defaults: () => clone(window.MARQUES_DEFAULT_CONTENT || {}),
  };

  document.addEventListener("DOMContentLoaded", () => {
    applyContent();
  });
})();
