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
        "Resumo executivo da semana",
        "Cenarios para juros, bolsa e cambio",
        "Teses para carteira e posicionamento",
      ],
      "destaques.html": [
        "Materia principal com contexto",
        "Cards de leitura rapida",
        "Curadoria visual para leitura eficiente",
      ],
      "noticias.html": [
        "Mais recentes, mercado, empresas e cripto",
        "Fontes conectadas para rotina diaria",
        "Leitura orientada para tomada de decisao",
      ],
      "agenda.html": [
        "Eventos macro que movem o mercado",
        "Horarios e impacto esperado",
        "Radar rapido para o dia",
      ],
      "newsletter.html": [
        "Cenario da semana",
        "Leitura macro com reflexo em carteira",
        "Visao sobre risco e oportunidade",
      ],
      "contato.html": [
        "Diagnostico patrimonial inicial",
        "Qualificacao por objetivo e horizonte",
        "Contato comercial com mais contexto",
      ],
    };

    return pointsByLink[item.link] || [
      "Conteudo editorial premium",
      "Leitura objetiva e rapida",
      "CTA para aprofundar na pagina",
    ];
  }

  function shouldReplaceHomeContent(content) {
    return (
      content.home?.eyebrow === "Portal editorial para investidores" ||
      content.home?.eyebrow === "Para investidores" ||
      content.home?.eyebrow === "Estrategia patrimonial com logica, prazo e gestao de risco" ||
      content.home?.title === "Analise, noticias e inteligencia de mercado em um portal so." ||
      content.home?.title ===
        "Transformamos leitura de mercado em decisoes patrimoniais para longo prazo, aposentadoria e cripto com disciplina." ||
      content.home?.teaserTitle === "Previa de cada pagina antes do clique" ||
      content.home?.teaserTitle === "Conteudo que sustenta a tese de alocacao" ||
      String(content.home?.description || "").includes("A Marques Invest nasce com um prop") ||
      String(content.home?.description || "").includes("A Marques Invest une inteligencia de mercado")
    );
  }

  function shouldReplaceNewsletterContent(content) {
    return (
      content.newsletter?.kicker === "Newsletter" ||
      content.newsletter?.title === "Receba um resumo do fechamento do mercado" ||
      content.newsletter?.title === "Receba a leitura do mercado com impacto pratico na sua alocacao." ||
      content.newsletter?.description ===
        "Pagina pronta para captacao de leads, automacao de e-mail e estrategia de relacionamento com investidores." ||
      content.newsletter?.description ===
        "Uma newsletter pensada para transformar ruido em clareza, com visao macro, leitura de risco e reflexo real em carteira, aposentadoria e exposicao a cripto." ||
      content.newsletter?.buttonLabel === "Quero receber a carta"
    );
  }

  function shouldReplaceContactContent(content) {
    return (
      content.contact?.kicker === "Contato" ||
      content.contact?.title === "Cadastre seus dados para atendimento especializado" ||
      content.contact?.title === "Agende um diagnostico patrimonial inicial" ||
      content.contact?.tag === "Atendimento" ||
      content.contact?.tag === "Triagem comercial" ||
      content.contact?.heading === "Consultoria para investidores e planejamento empresarial" ||
      content.contact?.heading === "Uma abordagem mais clara para transformar interesse em proposta." ||
      content.contact?.description ===
        "Preencha o cadastro para que a equipe entre em contato. O CEP busca automaticamente o endereco e voce so completa numero e complemento." ||
      content.contact?.description ===
        "Preencha seus dados, objetivo e momento patrimonial. O formulario ajuda a Marques Invest a entender melhor o seu caso antes do primeiro contato consultivo." ||
      (Array.isArray(content.contact?.benefits) &&
        content.contact.benefits.some(
          (item) =>
            item === "Atendimento personalizado" ||
            item === "Triagem rapida do perfil" ||
            item === "Formulario preparado para integracao futura com CRM" ||
            item === "Clareza sobre objetivo, horizonte e capacidade de aporte"
        ))
    );
  }

  function shouldReplaceAnalysisContent(content) {
    return (
      !content.analysis ||
      content.analysis.title === "O espaco para a principal leitura estrategica do periodo." ||
      content.analysis.sideTag === "O que teremos aqui" ||
      content.analysis.sideTitle === "Estrutura editorial da pagina"
    );
  }

  function upgradeLegacyContent(content) {
    const defaults = window.MARQUES_DEFAULT_CONTENT || {};

    if (!content.home || shouldReplaceHomeContent(content)) {
      content.home = clone(defaults.home || {});
    }

    if (
      Array.isArray(content.home.teasers) &&
      content.home.teasers.some(
        (item) =>
          item.title === "Newsletter" ||
          item.tag === "Relacionamento" ||
          String(item.description || "").includes("preenchimento automatico de CEP")
      )
    ) {
      content.home.teasers = clone(defaults.home.teasers);
    }

    if (!content.newsletter || shouldReplaceNewsletterContent(content)) {
      content.newsletter = clone(defaults.newsletter || {});
    }

    if (!content.contact || shouldReplaceContactContent(content)) {
      content.contact = clone(defaults.contact || {});
    }

    if (shouldReplaceAnalysisContent(content)) {
      content.analysis = clone(defaults.analysis || {});
    }

    if (!content.highlights) {
      content.highlights = clone(defaults.highlights || {});
    }

    return content;
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
              <span class="teaser-meta">${item.link === "contato.html" ? "Passo comercial" : item.link === "newsletter.html" ? "Produto editorial" : "Prova de autoridade"}</span>
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
      return upgradeLegacyContent(localContent);
    }

    try {
      const remoteContent = await window.MarquesSupabase.loadSiteSnapshot();
      return upgradeLegacyContent(merge(localContent, remoteContent));
    } catch (error) {
      return upgradeLegacyContent(localContent);
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
