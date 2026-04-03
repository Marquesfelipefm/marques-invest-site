(function () {
  const loginForm = document.querySelector("#admin-login-form");
  const loginStatus = document.querySelector("#admin-login-status");
  const loginButton = document.querySelector("#admin-login-button");
  const configNote = document.querySelector("#admin-config-note");
  const adminShell = document.querySelector("#admin-shell");
  const panelStatus = document.querySelector("#admin-panel-status");
  const tabButtons = document.querySelectorAll("[data-admin-tab]");
  const tabPanels = document.querySelectorAll("[data-admin-panel]");
  const settingsForm = document.querySelector("#admin-settings-form");
  const socialForm = document.querySelector("#admin-social-form");
  const contentForm = document.querySelector("#admin-content-form");
  const weeklyAnalysisForm = document.querySelector("#admin-weekly-analysis-form");
  const weeklyAnalysisPdfUrlInput = weeklyAnalysisForm?.querySelector("[name='analysis.pdfUrl']");
  const weeklyAnalysisPdfFileNameInput = weeklyAnalysisForm?.querySelector("[name='analysis.pdfFileName']");
  const weeklyAnalysisPdfFileInput = document.querySelector("#admin-weekly-analysis-pdf-file");
  const weeklyAnalysisPdfPreview = document.querySelector("#admin-weekly-analysis-pdf-preview");
  const postForm = document.querySelector("#admin-post-form");
  const postResetButton = document.querySelector("#admin-post-reset");
  const postTitleInput = postForm?.querySelector("[name='title']");
  const postSlugInput = postForm?.querySelector("[name='slug']");
  const postSeoTitleInput = postForm?.querySelector("[name='seo_title']");
  const postCoverUrlInput = postForm?.querySelector("[name='cover_url']");
  const postCoverAltInput = postForm?.querySelector("[name='cover_alt']");
  const postCoverFileInput = document.querySelector("#admin-post-cover-file");
  const postCoverPreview = document.querySelector("#admin-post-cover-preview");
  const analysisForm = document.querySelector("#admin-analysis-form");
  const analysisResetButton = document.querySelector("#admin-analysis-reset");
  const analysisTemplateButton = document.querySelector("#admin-analysis-template");
  const analysisTitleInput = analysisForm?.querySelector("[name='title']");
  const analysisSlugInput = analysisForm?.querySelector("[name='slug']");
  const analysisSeoTitleInput = analysisForm?.querySelector("[name='seo_title']");
  const analysisCoverUrlInput = analysisForm?.querySelector("[name='cover_url']");
  const analysisCoverAltInput = analysisForm?.querySelector("[name='cover_alt']");
  const analysisCoverFileInput = document.querySelector("#admin-analysis-cover-file");
  const analysisCoverPreview = document.querySelector("#admin-analysis-cover-preview");
  const agendaForm = document.querySelector("#admin-agenda-form");
  const agendaResetButton = document.querySelector("#admin-agenda-reset");
  const refreshButton = document.querySelector("#admin-refresh");
  const logoutButton = document.querySelector("#admin-logout");
  const postList = document.querySelector("#admin-post-list");
  const analysisList = document.querySelector("#admin-analysis-list");
  const agendaList = document.querySelector("#admin-agenda-list");
  const newsletterList = document.querySelector("#admin-newsletter-list");
  const contactList = document.querySelector("#admin-contact-list");

  const metricPosts = document.querySelector("#metric-posts");
  const metricAgenda = document.querySelector("#metric-agenda");
  const metricNewsletter = document.querySelector("#metric-newsletter");
  const metricContact = document.querySelector("#metric-contact");

  let snapshot = clone(window.MARQUES_DEFAULT_CONTENT || {});
  let posts = [];
  let agendaItems = [];
  let newsletterEntries = [];
  let contactEntries = [];
  let postDraftState = {
    lastSlug: "",
    lastSeoTitle: "",
  };
  let analysisDraftState = {
    lastSlug: "",
    lastSeoTitle: "",
  };

  const ANALYSIS_TEMPLATE = [
    "## Tese central",
    "Resuma em uma frase a principal leitura do artigo.",
    "",
    "## O que mudou",
    "- Ponto principal 1",
    "- Ponto principal 2",
    "- Ponto principal 3",
    "",
    "## Impacto patrimonial",
    "Explique como o tema afeta carteira, prazo, liquidez e gestao de risco.",
    "",
    "## O que observar agora",
    "- Variavel 1",
    "- Variavel 2",
    "",
    "## Leitura Marques",
    "Feche com a implicacao pratica para patrimonio e o proximo passo do investidor.",
  ].join("\n");

  if (!loginForm || !window.MarquesSupabase || !window.MARQUES_DEFAULT_CONTENT) {
    return;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
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

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function getPublicPostUrl(post) {
    const slug = post?.slug || slugify(post?.title || "post");
    return `noticia.html?slug=${encodeURIComponent(slug)}`;
  }

  function toDatetimeLocal(value) {
    if (!value) {
      return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const offset = date.getTimezoneOffset();
    const localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  }

  function fromDatetimeLocal(value) {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function formatDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Sem data";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(date);
  }

  function getPath(target, path) {
    return path.split(".").reduce((current, key) => current?.[key], target);
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function inferPostType(post) {
    const declaredType = normalizeText(post?.content_type);

    if (declaredType === "analysis") {
      return "analysis";
    }

    if (normalizeText(post?.source) === "analise marques") {
      return "analysis";
    }

    return "news";
  }

  function getPostsByType(type) {
    return posts.filter((post) => inferPostType(post) === type);
  }

  function setFieldValue(form, name, value) {
    const field = form?.querySelector(`[name='${name}']`);

    if (!field) {
      return;
    }

    if (field.type === "checkbox") {
      field.checked = Boolean(value);
      return;
    }

    field.value = typeof value === "string" ? value : value || "";
  }

  function assignPath(target, path, value) {
    const keys = path.split(".");
    let current = target;

    keys.forEach((key, index) => {
      if (index === keys.length - 1) {
        current[key] = value;
        return;
      }

      current[key] = current[key] || {};
      current = current[key];
    });
  }

  function setLoginStatus(message, tone = "default") {
    loginStatus.textContent = message;
    loginStatus.classList.remove("is-error", "is-success");

    if (tone === "error") {
      loginStatus.classList.add("is-error");
    }

    if (tone === "success") {
      loginStatus.classList.add("is-success");
    }
  }

  function setPanelStatus(message, tone = "default") {
    panelStatus.textContent = message;
    panelStatus.classList.remove("is-error", "is-success");

    if (tone === "error") {
      panelStatus.classList.add("is-error");
    }

    if (tone === "success") {
      panelStatus.classList.add("is-success");
    }
  }

  function setAuthState(isLoggedIn, user) {
    adminShell.hidden = !isLoggedIn;
    loginForm.hidden = isLoggedIn;

    if (isLoggedIn) {
      setLoginStatus(`Conectado como ${user?.email || "usuario autenticado"}.`, "success");
      return;
    }

    setLoginStatus("Faca login para administrar o site online.");
  }

  function switchTab(tabId) {
    tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.adminTab === tabId);
    });

    tabPanels.forEach((panel) => {
      const isCurrent = panel.dataset.adminPanel === tabId;
      panel.hidden = !isCurrent;
      panel.classList.toggle("is-active", isCurrent);
    });
  }

  function fillFormFromSnapshot(form, data) {
    if (!form) {
      return;
    }

    form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
      const currentValue = getPath(data, field.name);
      field.value = typeof currentValue === "string" ? currentValue : "";
    });
  }

  function fillContentForms() {
    fillFormFromSnapshot(settingsForm, snapshot);
    fillFormFromSnapshot(socialForm, snapshot);
    fillFormFromSnapshot(contentForm, snapshot);
    fillWeeklyAnalysisForm();
  }

  function fillWeeklyAnalysisForm() {
    if (!weeklyAnalysisForm) {
      return;
    }

    setFieldValue(weeklyAnalysisForm, "analysis.eyebrow", snapshot.analysis?.eyebrow || "");
    setFieldValue(weeklyAnalysisForm, "analysis.title", snapshot.analysis?.title || "");
    setFieldValue(weeklyAnalysisForm, "analysis.description", snapshot.analysis?.description || "");
    setFieldValue(weeklyAnalysisForm, "analysis.sideTag", snapshot.analysis?.sideTag || "");
    setFieldValue(weeklyAnalysisForm, "analysis.sideTitle", snapshot.analysis?.sideTitle || "");
    setFieldValue(
      weeklyAnalysisForm,
      "analysis.bulletsInput",
      Array.isArray(snapshot.analysis?.bullets) ? snapshot.analysis.bullets.join("\n") : ""
    );
    setFieldValue(weeklyAnalysisForm, "analysis.documentTitle", snapshot.analysis?.documentTitle || "");
    setFieldValue(weeklyAnalysisForm, "analysis.documentSummary", snapshot.analysis?.documentSummary || "");
    setFieldValue(weeklyAnalysisForm, "analysis.pdfUrl", snapshot.analysis?.pdfUrl || "");
    setFieldValue(weeklyAnalysisForm, "analysis.pdfFileName", snapshot.analysis?.pdfFileName || "");

    updatePdfPreview(
      weeklyAnalysisPdfPreview,
      snapshot.analysis?.pdfUrl || "",
      snapshot.analysis?.pdfFileName || "",
      "PDF da analise semanal"
    );
  }

  function readFormIntoSnapshot(form) {
    if (!form) {
      return;
    }

    form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
      assignPath(snapshot, field.name, field.value);
    });
  }

  function readWeeklyAnalysisFormIntoSnapshot() {
    if (!weeklyAnalysisForm) {
      return;
    }

    const bulletsRaw =
      weeklyAnalysisForm.querySelector("[name='analysis.bulletsInput']")?.value || "";

    snapshot.analysis = snapshot.analysis || {};
    snapshot.analysis.eyebrow =
      weeklyAnalysisForm.querySelector("[name='analysis.eyebrow']")?.value.trim() || "";
    snapshot.analysis.title =
      weeklyAnalysisForm.querySelector("[name='analysis.title']")?.value.trim() || "";
    snapshot.analysis.description =
      weeklyAnalysisForm.querySelector("[name='analysis.description']")?.value.trim() || "";
    snapshot.analysis.sideTag =
      weeklyAnalysisForm.querySelector("[name='analysis.sideTag']")?.value.trim() || "";
    snapshot.analysis.sideTitle =
      weeklyAnalysisForm.querySelector("[name='analysis.sideTitle']")?.value.trim() || "";
    snapshot.analysis.documentTitle =
      weeklyAnalysisForm.querySelector("[name='analysis.documentTitle']")?.value.trim() || "";
    snapshot.analysis.documentSummary =
      weeklyAnalysisForm.querySelector("[name='analysis.documentSummary']")?.value.trim() || "";
    snapshot.analysis.pdfUrl =
      weeklyAnalysisForm.querySelector("[name='analysis.pdfUrl']")?.value.trim() || "";
    snapshot.analysis.pdfFileName =
      weeklyAnalysisForm.querySelector("[name='analysis.pdfFileName']")?.value.trim() || "";
    snapshot.analysis.bullets = bulletsRaw
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function updateCoverPreview(previewElement, url, altText, label) {
    if (!previewElement) {
      return;
    }

    if (!url) {
      previewElement.hidden = true;
      previewElement.innerHTML = "";
      return;
    }

    previewElement.hidden = false;
    previewElement.innerHTML = `
      <span class="cover-preview-label">${escapeHtml(label)}</span>
      <img src="${escapeHtml(url)}" alt="${escapeHtml(altText || label)}" loading="lazy" />
    `;
  }

  function updatePdfPreview(previewElement, url, fileName, label) {
    if (!previewElement) {
      return;
    }

    if (!url) {
      previewElement.hidden = true;
      previewElement.innerHTML = "";
      return;
    }

    previewElement.hidden = false;
    previewElement.innerHTML = `
      <span class="cover-preview-label">${escapeHtml(label)}</span>
      <div class="pdf-preview-card">
        <div class="pdf-preview-copy">
          <strong>${escapeHtml(fileName || "Documento da analise semanal")}</strong>
          <p>O PDF sera exibido embutido na pagina Analise da semana, incluindo infograficos e elementos visuais.</p>
        </div>
        <div class="pdf-preview-actions">
          <a class="button button-secondary" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">
            Abrir PDF
          </a>
          <a class="button button-secondary" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" download>
            Baixar PDF
          </a>
        </div>
      </div>
    `;
  }

  async function fileToDataUrl(file) {
    if (!file || !file.type.startsWith("image/")) {
      throw new Error("Selecione uma imagem valida para a capa.");
    }

    const objectUrl = URL.createObjectURL(file);

    try {
      const image = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("Nao foi possivel abrir a imagem enviada."));
        img.src = objectUrl;
      });

      const maxWidth = 1600;
      const ratio = Math.min(1, maxWidth / image.width);
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Nao foi possivel preparar a imagem da capa.");
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      if (file.type === "image/png") {
        return canvas.toDataURL("image/png");
      }

      return canvas.toDataURL("image/jpeg", 0.84);
    } finally {
      URL.revokeObjectURL(objectUrl);
    }
  }

  function attachCoverField(form, fileInput, urlInput, altInput, previewElement, label) {
    if (!form || !urlInput || !previewElement) {
      return;
    }

    const syncPreview = () => {
      updateCoverPreview(previewElement, urlInput.value.trim(), altInput?.value.trim(), label);
    };

    urlInput.addEventListener("input", syncPreview);

    if (altInput) {
      altInput.addEventListener("input", syncPreview);
    }

    if (fileInput) {
      fileInput.addEventListener("change", async () => {
        const file = fileInput.files?.[0];

        if (!file) {
          syncPreview();
          return;
        }

        try {
          setPanelStatus("Otimizando imagem de capa...");
          const dataUrl = await fileToDataUrl(file);
          urlInput.value = dataUrl;

          if (altInput && !altInput.value.trim()) {
            const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
            altInput.value = baseName ? `Capa: ${baseName}` : "";
          }

          syncPreview();
          setPanelStatus("Imagem de capa pronta para publicacao.", "success");
        } catch (error) {
          setPanelStatus(error.message || "Falha ao preparar a imagem da capa.", "error");
        } finally {
          fileInput.value = "";
        }
      });
    }

    syncPreview();
  }

  function attachPdfField(fileInput, urlInput, fileNameInput, previewElement, options = {}) {
    if (!fileInput || !urlInput || !fileNameInput || !previewElement) {
      return;
    }

    const syncPreview = () => {
      updatePdfPreview(
        previewElement,
        urlInput.value.trim(),
        fileNameInput.value.trim(),
        options.label || "PDF enviado"
      );
    };

    urlInput.addEventListener("input", syncPreview);
    fileNameInput.addEventListener("input", syncPreview);

    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];

      if (!file) {
        syncPreview();
        return;
      }

      if (file.type !== "application/pdf") {
        setPanelStatus("Selecione um arquivo PDF valido para a analise semanal.", "error");
        fileInput.value = "";
        return;
      }

      try {
        setPanelStatus("Enviando PDF da analise semanal para o storage...");
        const upload = await window.MarquesSupabase.uploadPublicAsset("analysis-assets", file, {
          folder: "weekly-analysis",
        });

        urlInput.value = upload.publicUrl;
        fileNameInput.value = file.name;
        syncPreview();
        setPanelStatus("PDF enviado com sucesso e pronto para aparecer no site.", "success");
      } catch (error) {
        setPanelStatus(error.message || "Falha ao enviar o PDF da analise semanal.", "error");
      } finally {
        fileInput.value = "";
      }
    });

    syncPreview();
  }

  function resetEditorialForm(form, state, previewElement) {
    if (!form) {
      return;
    }

    form.reset();
    setFieldValue(form, "id", "");

    if (state) {
      state.lastSlug = "";
      state.lastSeoTitle = "";
    }

    if (previewElement) {
      updateCoverPreview(previewElement, "", "", "Capa selecionada");
    }
  }

  function syncEditorialDerivedFields(titleInput, slugInput, seoTitleInput, state) {
    if (!titleInput || !slugInput || !seoTitleInput || !state) {
      return;
    }

    const rawTitle = titleInput.value.trim();
    const nextSlug = slugify(rawTitle);
    const nextSeoTitle = rawTitle ? `${rawTitle} | Marques Invest` : "";

    if (!slugInput.value.trim() || slugInput.value === state.lastSlug) {
      slugInput.value = nextSlug;
    }

    if (!seoTitleInput.value.trim() || seoTitleInput.value === state.lastSeoTitle) {
      seoTitleInput.value = nextSeoTitle;
    }

    state.lastSlug = nextSlug;
    state.lastSeoTitle = nextSeoTitle;
  }

  function resetAgendaForm() {
    agendaForm.reset();
    agendaForm.querySelector("[name='id']").value = "";
  }

  function renderPostCollection(listElement, items, options = {}) {
    if (!listElement) {
      return;
    }

    if (!items.length) {
      listElement.innerHTML = `<div class="admin-empty">${escapeHtml(
        options.emptyMessage || "Nenhuma publicacao cadastrada ainda."
      )}</div>`;
      return;
    }

    const openLabel = options.openLabel || "Abrir post";
    const typeChip = options.typeChip ? `<span class="admin-chip">${escapeHtml(options.typeChip)}</span>` : "";

    listElement.innerHTML = items
      .map(
        (post) => `
          <article class="admin-item">
            <div class="admin-item-head">
              <div>
                <strong>${escapeHtml(post.title)}</strong>
                <div class="admin-item-meta">${escapeHtml(post.excerpt || "Sem resumo")}</div>
              </div>
              <div class="admin-chip-row">
                <span class="admin-chip ${post.status === "published" ? "is-live" : ""}">
                  ${escapeHtml(post.status)}
                </span>
                <span class="admin-chip">${escapeHtml(post.category)}</span>
                ${typeChip}
                ${post.featured ? '<span class="admin-chip is-live">destaque</span>' : ""}
              </div>
            </div>
            <div class="admin-item-meta">
              Slug: ${escapeHtml(post.slug || slugify(post.title || "post"))}<br />
              Fonte: ${escapeHtml(post.source || "Marques Invest")}<br />
              Publicacao: ${escapeHtml(formatDate(post.published_at || post.updated_at))}
            </div>
            <div class="admin-item-actions">
              ${
                post.status === "published"
                  ? `
                    <a class="button button-secondary" href="${getPublicPostUrl(post)}" target="_blank" rel="noreferrer">
                      ${escapeHtml(openLabel)}
                    </a>
                  `
                  : ""
              }
              <button type="button" class="button button-secondary" data-post-edit="${post.id}">Editar</button>
              <button type="button" class="button button-secondary" data-post-delete="${post.id}">Excluir</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderPosts() {
    metricPosts.textContent = String(posts.length);

    renderPostCollection(postList, getPostsByType("news"), {
      emptyMessage: "Nenhuma noticia diaria cadastrada ainda.",
      openLabel: "Abrir noticia",
      typeChip: "noticia",
    });

    renderPostCollection(analysisList, getPostsByType("analysis"), {
      emptyMessage: "Nenhum artigo da Analise Marques cadastrado ainda.",
      openLabel: "Abrir artigo",
      typeChip: "analise",
    });
  }

  function renderAgenda() {
    metricAgenda.textContent = String(agendaItems.length);

    if (!agendaItems.length) {
      agendaList.innerHTML = '<div class="admin-empty">Nenhum evento de agenda cadastrado ainda.</div>';
      return;
    }

    agendaList.innerHTML = agendaItems
      .map(
        (item) => `
          <article class="admin-item">
            <div class="admin-item-head">
              <div>
                <strong>${escapeHtml(item.title)}</strong>
                <div class="admin-item-meta">${escapeHtml(item.summary || "Sem resumo")}</div>
              </div>
              <div class="admin-chip-row">
                <span class="admin-chip ${item.status === "published" ? "is-live" : ""}">
                  ${escapeHtml(item.status)}
                </span>
                <span class="admin-chip">${escapeHtml(item.impact || "Sem impacto")}</span>
              </div>
            </div>
            <div class="admin-item-meta">
              Evento: ${escapeHtml(formatDate(item.event_at))}<br />
              Regiao: ${escapeHtml(item.region || "Nao definida")}
            </div>
            <div class="admin-item-actions">
              <button type="button" class="button button-secondary" data-agenda-edit="${item.id}">Editar</button>
              <button type="button" class="button button-secondary" data-agenda-delete="${item.id}">Excluir</button>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderNewsletterEntries() {
    metricNewsletter.textContent = String(newsletterEntries.length);

    if (!newsletterEntries.length) {
      newsletterList.innerHTML = '<div class="admin-empty">Nenhum lead de newsletter recebido ainda.</div>';
      return;
    }

    newsletterList.innerHTML = newsletterEntries
      .map(
        (item) => `
          <article class="admin-item">
            <div class="admin-item-head">
              <div>
                <strong>${escapeHtml(item.email)}</strong>
                <div class="admin-item-meta">${escapeHtml(item.name || "Sem nome informado")}</div>
              </div>
              <span class="admin-chip is-live">${escapeHtml(item.status || "active")}</span>
            </div>
            <div class="admin-item-meta">
              Entrada: ${escapeHtml(formatDate(item.created_at))}
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderContactEntries() {
    metricContact.textContent = String(contactEntries.length);

    if (!contactEntries.length) {
      contactList.innerHTML = '<div class="admin-empty">Nenhum lead de contato recebido ainda.</div>';
      return;
    }

    contactList.innerHTML = contactEntries
      .map(
        (item) => `
          <article class="admin-item">
            <div class="admin-item-head">
              <div>
                <strong>${escapeHtml(item.name)}</strong>
                <div class="admin-item-meta">${escapeHtml(item.email)} | ${escapeHtml(item.phone || "Sem telefone")}</div>
              </div>
              <span class="admin-chip is-live">${escapeHtml(item.service || "Atendimento")}</span>
            </div>
            <div class="admin-item-meta">
              Cidade: ${escapeHtml(item.city || "-")} / ${escapeHtml(item.state || "-")}<br />
              Faixa: ${escapeHtml(item.investment_range || "-")}<br />
              Entrada: ${escapeHtml(formatDate(item.created_at))}
            </div>
          </article>
        `
      )
      .join("");
  }

  function fillEditorialForm(form, item, state, previewElement) {
    if (!form || !item) {
      return;
    }

    setFieldValue(form, "id", item.id);
    setFieldValue(form, "title", item.title || "");
    setFieldValue(form, "slug", item.slug || "");
    setFieldValue(form, "category", item.category || "markets");
    setFieldValue(form, "status", item.status || "draft");
    setFieldValue(form, "source", item.source || "");
    setFieldValue(form, "published_at", toDatetimeLocal(item.published_at));
    setFieldValue(form, "external_url", item.external_url || "");
    setFieldValue(form, "cover_url", item.cover_url || "");
    setFieldValue(form, "cover_alt", item.cover_alt || "");
    setFieldValue(form, "excerpt", item.excerpt || "");
    setFieldValue(form, "seo_title", item.seo_title || "");
    setFieldValue(form, "seo_description", item.seo_description || "");
    setFieldValue(form, "featured", Boolean(item.featured));
    setFieldValue(form, "content", item.content || "");
    setFieldValue(form, "content_type", inferPostType(item));

    if (state) {
      state.lastSlug = item.slug || slugify(item.title || "post");
      state.lastSeoTitle = item.seo_title || `${item.title || ""} | Marques Invest`;
    }

    updateCoverPreview(
      previewElement,
      item.cover_url || "",
      item.cover_alt || "",
      inferPostType(item) === "analysis" ? "Capa do artigo" : "Capa da noticia"
    );
  }

  function loadPostIntoForm(id) {
    const item = posts.find((post) => post.id === id);

    if (!item) {
      return;
    }

    if (inferPostType(item) === "analysis") {
      fillEditorialForm(analysisForm, item, analysisDraftState, analysisCoverPreview);
      switchTab("analysis");
      return;
    }

    fillEditorialForm(postForm, item, postDraftState, postCoverPreview);
    switchTab("posts");
  }

  function loadAgendaIntoForm(id) {
    const item = agendaItems.find((eventItem) => eventItem.id === id);

    if (!item) {
      return;
    }

    agendaForm.querySelector("[name='id']").value = item.id;
    agendaForm.querySelector("[name='title']").value = item.title || "";
    agendaForm.querySelector("[name='summary']").value = item.summary || "";
    agendaForm.querySelector("[name='event_at']").value = toDatetimeLocal(item.event_at);
    agendaForm.querySelector("[name='impact']").value = item.impact || "Alta";
    agendaForm.querySelector("[name='region']").value = item.region || "";
    agendaForm.querySelector("[name='status']").value = item.status || "draft";
    switchTab("agenda");
  }

  async function loadSnapshot() {
    const defaults = clone(window.MARQUES_DEFAULT_CONTENT);

    try {
      const remoteSnapshot = await window.MarquesSupabase.loadSiteSnapshot();
      snapshot = merge(defaults, remoteSnapshot);
    } catch (error) {
      snapshot = defaults;
      throw error;
    }

    fillContentForms();
  }

  async function loadCollections() {
    const [postRows, agendaRows, newsletterRows, contactRows] = await Promise.all([
      window.MarquesSupabase.listAdminPosts(),
      window.MarquesSupabase.listAdminAgenda(),
      window.MarquesSupabase.listNewsletterSubscribers(),
      window.MarquesSupabase.listContactLeads(),
    ]);

    posts = Array.isArray(postRows) ? postRows : [];
    agendaItems = Array.isArray(agendaRows) ? agendaRows : [];
    newsletterEntries = Array.isArray(newsletterRows) ? newsletterRows : [];
    contactEntries = Array.isArray(contactRows) ? contactRows : [];

    renderPosts();
    renderAgenda();
    renderNewsletterEntries();
    renderContactEntries();
  }

  async function loadAllData() {
    setPanelStatus("Atualizando painel online...");

    try {
      await loadSnapshot();
      await loadCollections();
      setPanelStatus("Painel sincronizado com o banco online.", "success");
    } catch (error) {
      setPanelStatus(
        "Nao foi possivel carregar todos os dados. Verifique se o schema do Supabase ja foi aplicado.",
        "error"
      );
    }
  }

  async function handleEditorialSubmit(form, state, options = {}) {
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const slug = String(formData.get("slug") || slugify(title)).trim();
    const status = formData.get("status");
    const publishedAt =
      status === "published"
        ? fromDatetimeLocal(formData.get("published_at")) || new Date().toISOString()
        : fromDatetimeLocal(formData.get("published_at"));

    await window.MarquesSupabase.savePost({
      id: formData.get("id"),
      title,
      slug,
      category: formData.get("category"),
      status,
      content_type: formData.get("content_type") || options.contentType || "news",
      source: formData.get("source") || options.source || "Marques Invest",
      published_at: publishedAt,
      external_url: formData.get("external_url"),
      cover_url: formData.get("cover_url"),
      cover_alt: formData.get("cover_alt"),
      excerpt: formData.get("excerpt"),
      seo_title: formData.get("seo_title"),
      seo_description: formData.get("seo_description"),
      featured: form.querySelector("[name='featured']")?.checked,
      content: formData.get("content"),
    });

    resetEditorialForm(form, state, options.previewElement);
    await loadCollections();
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.querySelector("#admin-email").value.trim();
    const password = document.querySelector("#admin-password").value.trim();

    loginButton.disabled = true;
    setLoginStatus("Autenticando no Supabase...");

    try {
      await window.MarquesSupabase.signInWithPassword(email, password);
      const user = await window.MarquesSupabase.getUser();
      setAuthState(true, user);
      switchTab("settings");
      await loadAllData();
    } catch (error) {
      setAuthState(false);
      setLoginStatus(error.message || "Falha no login.", "error");
    } finally {
      loginButton.disabled = false;
    }
  });

  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      switchTab(button.dataset.adminTab);
    });
  });

  settingsForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    readFormIntoSnapshot(settingsForm);

    try {
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
      setPanelStatus("Configuracoes salvas com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar configuracoes.", "error");
    }
  });

  socialForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    readFormIntoSnapshot(socialForm);

    try {
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
      setPanelStatus("Links das redes salvos com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar links das redes.", "error");
    }
  });

  contentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    readFormIntoSnapshot(contentForm);

    try {
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
      setPanelStatus("Conteudo das paginas salvo com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar conteudo.", "error");
    }
  });

  weeklyAnalysisForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    readWeeklyAnalysisFormIntoSnapshot();

    try {
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
      fillWeeklyAnalysisForm();
      setPanelStatus("Analise da semana salva com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar a analise da semana.", "error");
    }
  });

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await handleEditorialSubmit(postForm, postDraftState, {
        contentType: "news",
        previewElement: postCoverPreview,
      });
      setPanelStatus("Noticia salva com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar a noticia.", "error");
    }
  });

  analysisForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    try {
      await handleEditorialSubmit(analysisForm, analysisDraftState, {
        contentType: "analysis",
        source: "Analise Marques",
        previewElement: analysisCoverPreview,
      });
      setPanelStatus("Artigo da Analise Marques salvo com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar o artigo.", "error");
    }
  });

  agendaForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(agendaForm);

    try {
      await window.MarquesSupabase.saveAgendaEvent({
        id: formData.get("id"),
        title: formData.get("title"),
        summary: formData.get("summary"),
        event_at: fromDatetimeLocal(formData.get("event_at")),
        impact: formData.get("impact"),
        region: formData.get("region"),
        status: formData.get("status"),
      });

      resetAgendaForm();
      await loadCollections();
      setPanelStatus("Evento da agenda salvo com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar o evento.", "error");
    }
  });

  postResetButton.addEventListener("click", () => {
    resetEditorialForm(postForm, postDraftState, postCoverPreview);
  });
  analysisResetButton.addEventListener("click", () => {
    resetEditorialForm(analysisForm, analysisDraftState, analysisCoverPreview);
  });
  agendaResetButton.addEventListener("click", resetAgendaForm);

  if (postTitleInput) {
    postTitleInput.addEventListener("input", () => {
      syncEditorialDerivedFields(postTitleInput, postSlugInput, postSeoTitleInput, postDraftState);
    });
  }

  if (analysisTitleInput) {
    analysisTitleInput.addEventListener("input", () => {
      syncEditorialDerivedFields(
        analysisTitleInput,
        analysisSlugInput,
        analysisSeoTitleInput,
        analysisDraftState
      );
    });
  }

  if (analysisTemplateButton) {
    analysisTemplateButton.addEventListener("click", () => {
      const contentField = analysisForm.querySelector("[name='content']");

      if (!contentField) {
        return;
      }

      if (contentField.value.trim()) {
        const confirmed = window.confirm(
          "Esse artigo ja tem conteudo. Deseja substituir pelo modelo padrao Analise Marques?"
        );

        if (!confirmed) {
          return;
        }
      }

      contentField.value = ANALYSIS_TEMPLATE;
      if (!analysisForm.querySelector("[name='excerpt']").value.trim()) {
        analysisForm.querySelector("[name='excerpt']").value =
          "Resumo executivo com a tese central, o que mudou e a implicacao patrimonial da leitura.";
      }
      setPanelStatus("Modelo editorial Marques aplicado ao artigo.", "success");
    });
  }

  attachCoverField(
    postForm,
    postCoverFileInput,
    postCoverUrlInput,
    postCoverAltInput,
    postCoverPreview,
    "Capa da noticia"
  );

  attachCoverField(
    analysisForm,
    analysisCoverFileInput,
    analysisCoverUrlInput,
    analysisCoverAltInput,
    analysisCoverPreview,
    "Capa do artigo"
  );

  attachPdfField(
    weeklyAnalysisPdfFileInput,
    weeklyAnalysisPdfUrlInput,
    weeklyAnalysisPdfFileNameInput,
    weeklyAnalysisPdfPreview,
    {
      label: "PDF da analise semanal",
    }
  );

  refreshButton.addEventListener("click", async () => {
    await loadAllData();
  });

  logoutButton.addEventListener("click", () => {
    window.MarquesSupabase.signOut();
    setAuthState(false);
    setPanelStatus("Sessao encerrada.");
  });

  async function handlePostListAction(event) {
    const editId = event.target.closest("[data-post-edit]")?.dataset.postEdit;
    const deleteId = event.target.closest("[data-post-delete]")?.dataset.postDelete;

    if (editId) {
      loadPostIntoForm(editId);
      return;
    }

    if (!deleteId) {
      return;
    }

    const confirmed = window.confirm("Deseja excluir este post?");

    if (!confirmed) {
      return;
    }

    try {
      await window.MarquesSupabase.deletePost(deleteId);
      await loadCollections();
      setPanelStatus("Post excluido com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao excluir o post.", "error");
    }
  }

  postList.addEventListener("click", handlePostListAction);
  analysisList.addEventListener("click", handlePostListAction);

  agendaList.addEventListener("click", async (event) => {
    const editId = event.target.closest("[data-agenda-edit]")?.dataset.agendaEdit;
    const deleteId = event.target.closest("[data-agenda-delete]")?.dataset.agendaDelete;

    if (editId) {
      loadAgendaIntoForm(editId);
      return;
    }

    if (!deleteId) {
      return;
    }

    const confirmed = window.confirm("Deseja excluir este evento?");

    if (!confirmed) {
      return;
    }

    try {
      await window.MarquesSupabase.deleteAgendaEvent(deleteId);
      await loadCollections();
      setPanelStatus("Evento excluido com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao excluir o evento.", "error");
    }
  });

  document.addEventListener("click", (event) => {
    const socialButton = event.target.closest("[data-social-open]");

    if (!socialButton) {
      return;
    }

    const network = socialButton.dataset.socialOpen;
    const link = snapshot.settings?.socialLinks?.[network];

    if (!link) {
      setPanelStatus(
        `Cadastre primeiro o link da rede ${network} antes de abrir.`,
        "error"
      );
      return;
    }

    window.open(link, "_blank", "noopener,noreferrer");
  });

  (async function init() {
    if (!window.MarquesSupabase.isConfigured()) {
      configNote.hidden = false;
      loginButton.disabled = true;
      setAuthState(false);
      setPanelStatus(
        "Preencha assets/js/supabase-config.js e aplique o schema SQL para ativar o painel online."
      );
      return;
    }

    configNote.hidden = true;
    loginButton.disabled = false;

    const user = await window.MarquesSupabase.getUser();

    if (!user) {
      setAuthState(false);
      setPanelStatus("Supabase configurado. Faca login para administrar o site.");
      return;
    }

    setAuthState(true, user);
    switchTab("settings");
    await loadAllData();
  })();
})();
