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
  let postDraftState = { lastSlug: "", lastSeoTitle: "" };
  let analysisDraftState = { lastSlug: "", lastSeoTitle: "" };
  let formDirty = false;

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

  /* ── Toast Notification System ── */

  var toastContainer = document.createElement("div");
  toastContainer.className = "admin-toast-container";
  document.body.appendChild(toastContainer);

  function showToast(message, type, duration) {
    if (typeof type === "undefined") type = "success";
    if (typeof duration === "undefined") duration = type === "error" ? 6000 : 3500;

    var toast = document.createElement("div");
    toast.className = "admin-toast is-" + type;

    var icons = { success: "\u2713", error: "\u2717", loading: "\u21BB" };
    toast.innerHTML =
      '<span class="admin-toast-icon">' + (icons[type] || "") + "</span>" +
      '<span class="admin-toast-message">' + escapeHtml(message) + "</span>" +
      '<button class="admin-toast-close" type="button">\u00D7</button>';

    toast.querySelector(".admin-toast-close").addEventListener("click", function () {
      dismissToast(toast);
    });

    toastContainer.appendChild(toast);

    if (type !== "loading") {
      setTimeout(function () { dismissToast(toast); }, duration);
    }

    return toast;
  }

  function dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add("is-leaving");
    setTimeout(function () { toast.remove(); }, 300);
  }

  /* ── Loading Button Helper ── */

  function setButtonLoading(button, loading) {
    if (!button) return;
    if (loading) {
      button.classList.add("is-loading");
      button.disabled = true;
    } else {
      button.classList.remove("is-loading");
      button.disabled = false;
    }
  }

  /* ── Delete Confirmation Modal ── */

  function confirmDelete(title, detail) {
    return new Promise(function (resolve) {
      var overlay = document.createElement("div");
      overlay.className = "admin-modal-overlay";
      overlay.innerHTML =
        '<div class="admin-modal">' +
        '<h4>Confirmar exclusao</h4>' +
        '<p>Voce vai excluir <strong>' + escapeHtml(title || "este item") + '</strong>.' +
        (detail ? '<br><span style="color:var(--text-soft);font-size:0.82rem">' + escapeHtml(detail) + '</span>' : '') +
        ' Esta acao nao pode ser desfeita.</p>' +
        '<div class="admin-modal-actions">' +
        '<button type="button" class="button button-secondary" data-modal-cancel>Cancelar</button>' +
        '<button type="button" class="button-danger" data-modal-confirm>Excluir</button>' +
        '</div></div>';

      overlay.querySelector("[data-modal-cancel]").addEventListener("click", function () {
        overlay.remove();
        resolve(false);
      });
      overlay.querySelector("[data-modal-confirm]").addEventListener("click", function () {
        overlay.remove();
        resolve(true);
      });
      overlay.addEventListener("click", function (e) {
        if (e.target === overlay) { overlay.remove(); resolve(false); }
      });

      document.body.appendChild(overlay);
    });
  }

  /* ── Tab Count Badges ── */

  function updateTabCounts() {
    var counts = {
      posts: getPostsByType("news").length,
      analysis: getPostsByType("analysis").length,
      agenda: agendaItems.length,
      newsletter: newsletterEntries.length,
      contact: contactEntries.length,
    };

    tabButtons.forEach(function (btn) {
      var tab = btn.dataset.adminTab;
      var count = counts[tab];
      var badge = btn.querySelector(".tab-count");

      if (typeof count === "number") {
        if (!badge) {
          badge = document.createElement("span");
          badge.className = "tab-count";
          btn.appendChild(badge);
        }
        badge.textContent = String(count);
      }
    });
  }

  /* ── Search/Filter in Lists ── */

  function createSearchBar(listContainer, placeholder, onFilter) {
    var existing = listContainer.parentNode.querySelector(".admin-search");
    if (existing) existing.remove();

    var bar = document.createElement("div");
    bar.className = "admin-search";
    bar.innerHTML =
      '<span class="admin-search-icon">\uD83D\uDD0D</span>' +
      '<input type="text" placeholder="' + escapeHtml(placeholder || "Buscar...") + '" />' +
      '<span class="admin-search-count"></span>';

    listContainer.parentNode.insertBefore(bar, listContainer);
    var input = bar.querySelector("input");
    var countEl = bar.querySelector(".admin-search-count");

    input.addEventListener("input", function () {
      onFilter(input.value.trim(), countEl);
    });

    return { bar: bar, input: input, countEl: countEl };
  }

  function filterListItems(listElement, query, countEl) {
    var items = listElement.querySelectorAll(".admin-item");
    var visible = 0;
    var norm = normalizeText(query);

    items.forEach(function (item) {
      var text = normalizeText(item.textContent);
      var match = !norm || text.indexOf(norm) > -1;
      item.style.display = match ? "" : "none";
      if (match) visible++;
    });

    if (countEl) {
      countEl.textContent = norm ? visible + " de " + items.length : "";
    }
  }

  /* ── Unsaved Changes Warning ── */

  function trackFormChanges(form) {
    if (!form) return;
    form.addEventListener("input", function () {
      formDirty = true;
    });
  }

  function clearDirty() {
    formDirty = false;
  }

  window.addEventListener("beforeunload", function (e) {
    if (formDirty) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  /* ── Utility functions ── */

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function merge(target, source) {
    if (!source || typeof source !== "object") return target;
    Object.keys(source).forEach(function (key) {
      var sourceValue = source[key];
      if (Array.isArray(sourceValue)) { target[key] = sourceValue; return; }
      if (sourceValue && typeof sourceValue === "object") { target[key] = merge(target[key] || {}, sourceValue); return; }
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
    return String(value || "").toLowerCase().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  function getPublicPostUrl(post) {
    var slug = post?.slug || slugify(post?.title || "post");
    return "noticia.html?slug=" + encodeURIComponent(slug);
  }

  function toDatetimeLocal(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    var offset = date.getTimezoneOffset();
    var localDate = new Date(date.getTime() - offset * 60 * 1000);
    return localDate.toISOString().slice(0, 16);
  }

  function fromDatetimeLocal(value) {
    if (!value) return null;
    var date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
  }

  function formatDate(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Sem data";
    return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(date);
  }

  function getPath(target, path) {
    return path.split(".").reduce(function (current, key) { return current?.[key]; }, target);
  }

  function normalizeText(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  }

  function inferPostType(post) {
    var declaredType = normalizeText(post?.content_type);
    if (declaredType === "analysis") return "analysis";
    if (normalizeText(post?.source) === "analise marques") return "analysis";
    return "news";
  }

  function getPostsByType(type) {
    return posts.filter(function (post) { return inferPostType(post) === type; });
  }

  function setFieldValue(form, name, value) {
    var field = form?.querySelector("[name='" + name + "']");
    if (!field) return;
    if (field.type === "checkbox") { field.checked = Boolean(value); return; }
    field.value = typeof value === "string" ? value : value || "";
  }

  function assignPath(target, path, value) {
    var keys = path.split(".");
    var current = target;
    keys.forEach(function (key, index) {
      if (index === keys.length - 1) { current[key] = value; return; }
      current[key] = current[key] || {};
      current = current[key];
    });
  }

  function setLoginStatus(message, tone) {
    if (!tone) tone = "default";
    loginStatus.textContent = message;
    loginStatus.classList.remove("is-error", "is-success");
    if (tone === "error") loginStatus.classList.add("is-error");
    if (tone === "success") loginStatus.classList.add("is-success");
  }

  function setPanelStatus(message, tone) {
    if (!tone) tone = "default";
    panelStatus.textContent = message;
    panelStatus.classList.remove("is-error", "is-success");
    if (tone === "error") panelStatus.classList.add("is-error");
    if (tone === "success") panelStatus.classList.add("is-success");
  }

  function setAuthState(isLoggedIn, user) {
    adminShell.hidden = !isLoggedIn;
    loginForm.hidden = isLoggedIn;
    if (isLoggedIn) {
      setLoginStatus("Conectado como " + (user?.email || "usuario autenticado") + ".", "success");
      return;
    }
    setLoginStatus("Faca login para administrar o site online.");
  }

  function switchTab(tabId) {
    tabButtons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.adminTab === tabId);
    });
    tabPanels.forEach(function (panel) {
      var isCurrent = panel.dataset.adminPanel === tabId;
      panel.hidden = !isCurrent;
      panel.classList.toggle("is-active", isCurrent);
    });
  }

  function fillFormFromSnapshot(form, data) {
    if (!form) return;
    form.querySelectorAll("input[name], select[name], textarea[name]").forEach(function (field) {
      var currentValue = getPath(data, field.name);
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
    if (!weeklyAnalysisForm) return;
    setFieldValue(weeklyAnalysisForm, "analysis.eyebrow", snapshot.analysis?.eyebrow || "");
    setFieldValue(weeklyAnalysisForm, "analysis.title", snapshot.analysis?.title || "");
    setFieldValue(weeklyAnalysisForm, "analysis.description", snapshot.analysis?.description || "");
    setFieldValue(weeklyAnalysisForm, "analysis.sideTag", snapshot.analysis?.sideTag || "");
    setFieldValue(weeklyAnalysisForm, "analysis.sideTitle", snapshot.analysis?.sideTitle || "");
    setFieldValue(weeklyAnalysisForm, "analysis.bulletsInput",
      Array.isArray(snapshot.analysis?.bullets) ? snapshot.analysis.bullets.join("\n") : "");
    setFieldValue(weeklyAnalysisForm, "analysis.documentTitle", snapshot.analysis?.documentTitle || "");
    setFieldValue(weeklyAnalysisForm, "analysis.documentSummary", snapshot.analysis?.documentSummary || "");
    setFieldValue(weeklyAnalysisForm, "analysis.pdfUrl", snapshot.analysis?.pdfUrl || "");
    setFieldValue(weeklyAnalysisForm, "analysis.pdfFileName", snapshot.analysis?.pdfFileName || "");
    updatePdfPreview(weeklyAnalysisPdfPreview, snapshot.analysis?.pdfUrl || "", snapshot.analysis?.pdfFileName || "", "PDF da analise semanal");
  }

  function readFormIntoSnapshot(form) {
    if (!form) return;
    form.querySelectorAll("input[name], select[name], textarea[name]").forEach(function (field) {
      assignPath(snapshot, field.name, field.value);
    });
  }

  function readWeeklyAnalysisFormIntoSnapshot() {
    if (!weeklyAnalysisForm) return;
    var bulletsRaw = weeklyAnalysisForm.querySelector("[name='analysis.bulletsInput']")?.value || "";
    snapshot.analysis = snapshot.analysis || {};
    snapshot.analysis.eyebrow = weeklyAnalysisForm.querySelector("[name='analysis.eyebrow']")?.value.trim() || "";
    snapshot.analysis.title = weeklyAnalysisForm.querySelector("[name='analysis.title']")?.value.trim() || "";
    snapshot.analysis.description = weeklyAnalysisForm.querySelector("[name='analysis.description']")?.value.trim() || "";
    snapshot.analysis.sideTag = weeklyAnalysisForm.querySelector("[name='analysis.sideTag']")?.value.trim() || "";
    snapshot.analysis.sideTitle = weeklyAnalysisForm.querySelector("[name='analysis.sideTitle']")?.value.trim() || "";
    snapshot.analysis.documentTitle = weeklyAnalysisForm.querySelector("[name='analysis.documentTitle']")?.value.trim() || "";
    snapshot.analysis.documentSummary = weeklyAnalysisForm.querySelector("[name='analysis.documentSummary']")?.value.trim() || "";
    snapshot.analysis.pdfUrl = weeklyAnalysisForm.querySelector("[name='analysis.pdfUrl']")?.value.trim() || "";
    snapshot.analysis.pdfFileName = weeklyAnalysisForm.querySelector("[name='analysis.pdfFileName']")?.value.trim() || "";
    snapshot.analysis.bullets = bulletsRaw.split("\n").map(function (item) { return item.trim(); }).filter(Boolean);
  }

  function updateCoverPreview(previewElement, url, altText, label) {
    if (!previewElement) return;
    if (!url) { previewElement.hidden = true; previewElement.innerHTML = ""; return; }
    previewElement.hidden = false;
    previewElement.innerHTML =
      '<span class="cover-preview-label">' + escapeHtml(label) + '</span>' +
      '<img src="' + escapeHtml(url) + '" alt="' + escapeHtml(altText || label) + '" loading="lazy" />';
  }

  function updatePdfPreview(previewElement, url, fileName, label) {
    if (!previewElement) return;
    if (!url) { previewElement.hidden = true; previewElement.innerHTML = ""; return; }
    previewElement.hidden = false;
    previewElement.innerHTML =
      '<span class="cover-preview-label">' + escapeHtml(label) + '</span>' +
      '<div class="pdf-preview-card"><div class="pdf-preview-copy">' +
      '<strong>' + escapeHtml(fileName || "Documento da analise semanal") + '</strong>' +
      '<p>O PDF sera exibido embutido na pagina Analise da semana, incluindo infograficos e elementos visuais.</p></div>' +
      '<div class="pdf-preview-actions">' +
      '<a class="button button-secondary" href="' + escapeHtml(url) + '" target="_blank" rel="noreferrer">Abrir PDF</a>' +
      '<a class="button button-secondary" href="' + escapeHtml(url) + '" target="_blank" rel="noreferrer" download>Baixar PDF</a>' +
      '</div></div>';
  }

  async function fileToDataUrl(file) {
    if (!file || !file.type.startsWith("image/")) throw new Error("Selecione uma imagem valida para a capa.");
    var objectUrl = URL.createObjectURL(file);
    try {
      var image = await new Promise(function (resolve, reject) {
        var img = new Image();
        img.onload = function () { resolve(img); };
        img.onerror = function () { reject(new Error("Nao foi possivel abrir a imagem enviada.")); };
        img.src = objectUrl;
      });
      var maxWidth = 1600;
      var ratio = Math.min(1, maxWidth / image.width);
      var canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      var context = canvas.getContext("2d");
      if (!context) throw new Error("Nao foi possivel preparar a imagem da capa.");
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      return file.type === "image/png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.84);
    } finally { URL.revokeObjectURL(objectUrl); }
  }

  function attachCoverField(form, fileInput, urlInput, altInput, previewElement, label) {
    if (!form || !urlInput || !previewElement) return;
    var syncPreview = function () {
      updateCoverPreview(previewElement, urlInput.value.trim(), altInput?.value.trim(), label);
    };
    urlInput.addEventListener("input", syncPreview);
    if (altInput) altInput.addEventListener("input", syncPreview);
    if (fileInput) {
      fileInput.addEventListener("change", async function () {
        var file = fileInput.files?.[0];
        if (!file) { syncPreview(); return; }
        var loadingToast = showToast("Otimizando imagem de capa...", "loading");
        try {
          var dataUrl = await fileToDataUrl(file);
          urlInput.value = dataUrl;
          if (altInput && !altInput.value.trim()) {
            var baseName = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
            altInput.value = baseName ? "Capa: " + baseName : "";
          }
          syncPreview();
          dismissToast(loadingToast);
          showToast("Imagem de capa pronta para publicacao.", "success");
        } catch (error) {
          dismissToast(loadingToast);
          showToast(error.message || "Falha ao preparar a imagem da capa.", "error");
        } finally { fileInput.value = ""; }
      });
    }
    syncPreview();
  }

  function attachPdfField(fileInput, urlInput, fileNameInput, previewElement, options) {
    if (!options) options = {};
    if (!fileInput || !urlInput || !fileNameInput || !previewElement) return;
    var syncPreview = function () {
      updatePdfPreview(previewElement, urlInput.value.trim(), fileNameInput.value.trim(), options.label || "PDF enviado");
    };
    urlInput.addEventListener("input", syncPreview);
    fileNameInput.addEventListener("input", syncPreview);
    fileInput.addEventListener("change", async function () {
      var file = fileInput.files?.[0];
      if (!file) { syncPreview(); return; }
      if (file.type !== "application/pdf") {
        showToast("Selecione um arquivo PDF valido para a analise semanal.", "error");
        fileInput.value = "";
        return;
      }
      var loadingToast = showToast("Enviando PDF da analise semanal...", "loading");
      try {
        var upload = await window.MarquesSupabase.uploadPublicAsset("analysis-assets", file, { folder: "weekly-analysis" });
        urlInput.value = upload.publicUrl;
        fileNameInput.value = file.name;
        syncPreview();
        dismissToast(loadingToast);
        showToast("PDF enviado com sucesso!", "success");
      } catch (error) {
        dismissToast(loadingToast);
        var rawMessage = error.message || "";
        var normalizedMessage = rawMessage.toLowerCase();
        if (normalizedMessage.indexOf("bucket not found") > -1) {
          showToast("Bucket 'analysis-assets' nao existe no Supabase. Crie-o no Storage.", "error");
        } else if (normalizedMessage.indexOf("row-level security policy") > -1) {
          showToast("Bucket existe mas sem policies de upload. Rode o schema SQL.", "error");
        } else {
          showToast(rawMessage || "Falha ao enviar o PDF.", "error");
        }
      } finally { fileInput.value = ""; }
    });
    syncPreview();
  }

  function resetEditorialForm(form, state, previewElement) {
    if (!form) return;
    form.reset();
    setFieldValue(form, "id", "");
    if (state) { state.lastSlug = ""; state.lastSeoTitle = ""; }
    if (previewElement) updateCoverPreview(previewElement, "", "", "Capa selecionada");
    clearDirty();
  }

  function syncEditorialDerivedFields(titleInput, slugInput, seoTitleInput, state) {
    if (!titleInput || !slugInput || !seoTitleInput || !state) return;
    var rawTitle = titleInput.value.trim();
    var nextSlug = slugify(rawTitle);
    var nextSeoTitle = rawTitle ? rawTitle + " | Marques Invest" : "";
    if (!slugInput.value.trim() || slugInput.value === state.lastSlug) slugInput.value = nextSlug;
    if (!seoTitleInput.value.trim() || seoTitleInput.value === state.lastSeoTitle) seoTitleInput.value = nextSeoTitle;
    state.lastSlug = nextSlug;
    state.lastSeoTitle = nextSeoTitle;
  }

  function resetAgendaForm() {
    agendaForm.reset();
    agendaForm.querySelector("[name='id']").value = "";
    clearDirty();
  }

  function renderPostCollection(listElement, items, options) {
    if (!options) options = {};
    if (!listElement) return;
    if (!items.length) {
      listElement.innerHTML = '<div class="admin-empty">' + escapeHtml(options.emptyMessage || "Nenhuma publicacao cadastrada ainda.") + "</div>";
      return;
    }
    var openLabel = options.openLabel || "Abrir post";
    var typeChip = options.typeChip ? '<span class="admin-chip">' + escapeHtml(options.typeChip) + "</span>" : "";
    listElement.innerHTML = items.map(function (post) {
      return '<article class="admin-item">' +
        '<div class="admin-item-head"><div>' +
        "<strong>" + escapeHtml(post.title) + "</strong>" +
        '<div class="admin-item-meta">' + escapeHtml(post.excerpt || "Sem resumo") + "</div>" +
        '</div><div class="admin-chip-row">' +
        '<span class="admin-chip ' + (post.status === "published" ? "is-live" : "") + '">' + escapeHtml(post.status) + "</span>" +
        '<span class="admin-chip">' + escapeHtml(post.category) + "</span>" +
        typeChip +
        (post.featured ? '<span class="admin-chip is-live">destaque</span>' : "") +
        "</div></div>" +
        '<div class="admin-item-meta">' +
        "Slug: " + escapeHtml(post.slug || slugify(post.title || "post")) + "<br />" +
        "Fonte: " + escapeHtml(post.source || "Marques Invest") + "<br />" +
        "Publicacao: " + escapeHtml(formatDate(post.published_at || post.updated_at)) +
        "</div>" +
        '<div class="admin-item-actions">' +
        (post.status === "published"
          ? '<a class="button button-secondary" href="' + getPublicPostUrl(post) + '" target="_blank" rel="noreferrer">' + escapeHtml(openLabel) + "</a>"
          : "") +
        '<button type="button" class="button button-secondary" data-post-edit="' + post.id + '">Editar</button>' +
        '<button type="button" class="button button-secondary" data-post-delete="' + post.id + '">Excluir</button>' +
        "</div></article>";
    }).join("");
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
    agendaList.innerHTML = agendaItems.map(function (item) {
      return '<article class="admin-item"><div class="admin-item-head"><div>' +
        "<strong>" + escapeHtml(item.title) + "</strong>" +
        '<div class="admin-item-meta">' + escapeHtml(item.summary || "Sem resumo") + "</div>" +
        '</div><div class="admin-chip-row">' +
        '<span class="admin-chip ' + (item.status === "published" ? "is-live" : "") + '">' + escapeHtml(item.status) + "</span>" +
        '<span class="admin-chip">' + escapeHtml(item.impact || "Sem impacto") + "</span>" +
        "</div></div>" +
        '<div class="admin-item-meta">Evento: ' + escapeHtml(formatDate(item.event_at)) + "<br />Regiao: " + escapeHtml(item.region || "Nao definida") + "</div>" +
        '<div class="admin-item-actions">' +
        '<button type="button" class="button button-secondary" data-agenda-edit="' + item.id + '">Editar</button>' +
        '<button type="button" class="button button-secondary" data-agenda-delete="' + item.id + '">Excluir</button>' +
        "</div></article>";
    }).join("");
  }

  function renderNewsletterEntries() {
    metricNewsletter.textContent = String(newsletterEntries.length);
    if (!newsletterEntries.length) {
      newsletterList.innerHTML = '<div class="admin-empty">Nenhum lead de newsletter recebido ainda.</div>';
      return;
    }
    newsletterList.innerHTML = newsletterEntries.map(function (item) {
      return '<article class="admin-item"><div class="admin-item-head"><div>' +
        "<strong>" + escapeHtml(item.email) + "</strong>" +
        '<div class="admin-item-meta">' + escapeHtml(item.name || "Sem nome informado") + "</div>" +
        '</div><span class="admin-chip is-live">' + escapeHtml(item.status || "active") + "</span></div>" +
        '<div class="admin-item-meta">Entrada: ' + escapeHtml(formatDate(item.created_at)) + "</div></article>";
    }).join("");
  }

  function renderContactEntries() {
    metricContact.textContent = String(contactEntries.length);
    if (!contactEntries.length) {
      contactList.innerHTML = '<div class="admin-empty">Nenhum lead de contato recebido ainda.</div>';
      return;
    }
    contactList.innerHTML = contactEntries.map(function (item) {
      return '<article class="admin-item"><div class="admin-item-head"><div>' +
        "<strong>" + escapeHtml(item.name) + "</strong>" +
        '<div class="admin-item-meta">' + escapeHtml(item.email) + " | " + escapeHtml(item.phone || "Sem telefone") + "</div>" +
        '</div><span class="admin-chip is-live">' + escapeHtml(item.service || "Atendimento") + "</span></div>" +
        '<div class="admin-item-meta">Cidade: ' + escapeHtml(item.city || "-") + " / " + escapeHtml(item.state || "-") +
        "<br />Faixa: " + escapeHtml(item.investment_range || "-") +
        "<br />Entrada: " + escapeHtml(formatDate(item.created_at)) + "</div></article>";
    }).join("");
  }

  function fillEditorialForm(form, item, state, previewElement) {
    if (!form || !item) return;
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
      state.lastSeoTitle = item.seo_title || (item.title || "") + " | Marques Invest";
    }
    updateCoverPreview(previewElement, item.cover_url || "", item.cover_alt || "",
      inferPostType(item) === "analysis" ? "Capa do artigo" : "Capa da noticia");
  }

  function loadPostIntoForm(id) {
    var item = posts.find(function (post) { return post.id === id; });
    if (!item) return;
    if (inferPostType(item) === "analysis") {
      fillEditorialForm(analysisForm, item, analysisDraftState, analysisCoverPreview);
      switchTab("analysis");
      analysisForm?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    fillEditorialForm(postForm, item, postDraftState, postCoverPreview);
    switchTab("posts");
    postForm?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function loadAgendaIntoForm(id) {
    var item = agendaItems.find(function (eventItem) { return eventItem.id === id; });
    if (!item) return;
    agendaForm.querySelector("[name='id']").value = item.id;
    agendaForm.querySelector("[name='title']").value = item.title || "";
    agendaForm.querySelector("[name='summary']").value = item.summary || "";
    agendaForm.querySelector("[name='event_at']").value = toDatetimeLocal(item.event_at);
    agendaForm.querySelector("[name='impact']").value = item.impact || "Alta";
    agendaForm.querySelector("[name='region']").value = item.region || "";
    agendaForm.querySelector("[name='status']").value = item.status || "draft";
    switchTab("agenda");
    agendaForm?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function loadSnapshot() {
    var defaults = clone(window.MARQUES_DEFAULT_CONTENT);
    try {
      var remoteSnapshot = await window.MarquesSupabase.loadSiteSnapshot();
      snapshot = merge(defaults, remoteSnapshot);
    } catch (error) {
      snapshot = defaults;
      throw error;
    }
    fillContentForms();
  }

  async function loadCollections() {
    var results = await Promise.all([
      window.MarquesSupabase.listAdminPosts(),
      window.MarquesSupabase.listAdminAgenda(),
      window.MarquesSupabase.listNewsletterSubscribers(),
      window.MarquesSupabase.listContactLeads(),
    ]);
    posts = Array.isArray(results[0]) ? results[0] : [];
    agendaItems = Array.isArray(results[1]) ? results[1] : [];
    newsletterEntries = Array.isArray(results[2]) ? results[2] : [];
    contactEntries = Array.isArray(results[3]) ? results[3] : [];
    renderPosts();
    renderAgenda();
    renderNewsletterEntries();
    renderContactEntries();
    updateTabCounts();
    setupSearchBars();
  }

  async function loadAllData() {
    var loadingToast = showToast("Atualizando painel online...", "loading");
    try {
      await loadSnapshot();
      await loadCollections();
      dismissToast(loadingToast);
      showToast("Painel sincronizado com o banco online.", "success");
      setPanelStatus("Ultima sincronizacao: " + new Date().toLocaleTimeString("pt-BR"), "success");
    } catch (error) {
      dismissToast(loadingToast);
      showToast("Falha ao carregar dados. Verifique o schema do Supabase.", "error");
      setPanelStatus("Erro na sincronizacao.", "error");
    }
  }

  async function handleEditorialSubmit(form, state, options) {
    if (!options) options = {};
    var formData = new FormData(form);
    var title = String(formData.get("title") || "").trim();
    var slug = String(formData.get("slug") || slugify(title)).trim();
    var status = formData.get("status");
    var publishedAt = status === "published"
      ? fromDatetimeLocal(formData.get("published_at")) || new Date().toISOString()
      : fromDatetimeLocal(formData.get("published_at"));

    await window.MarquesSupabase.savePost({
      id: formData.get("id"), title: title, slug: slug,
      category: formData.get("category"), status: status,
      content_type: formData.get("content_type") || options.contentType || "news",
      source: formData.get("source") || options.source || "Marques Invest",
      published_at: publishedAt, external_url: formData.get("external_url"),
      cover_url: formData.get("cover_url"), cover_alt: formData.get("cover_alt"),
      excerpt: formData.get("excerpt"), seo_title: formData.get("seo_title"),
      seo_description: formData.get("seo_description"),
      featured: form.querySelector("[name='featured']")?.checked,
      content: formData.get("content"),
    });

    resetEditorialForm(form, state, options.previewElement);
    await loadCollections();
  }

  /* ── Search Bars Setup ── */

  function setupSearchBars() {
    if (postList && getPostsByType("news").length > 3) {
      createSearchBar(postList, "Buscar noticias...", function (q, c) { filterListItems(postList, q, c); });
    }
    if (analysisList && getPostsByType("analysis").length > 3) {
      createSearchBar(analysisList, "Buscar artigos...", function (q, c) { filterListItems(analysisList, q, c); });
    }
    if (agendaList && agendaItems.length > 3) {
      createSearchBar(agendaList, "Buscar eventos...", function (q, c) { filterListItems(agendaList, q, c); });
    }
    if (newsletterList && newsletterEntries.length > 3) {
      createSearchBar(newsletterList, "Buscar assinantes...", function (q, c) { filterListItems(newsletterList, q, c); });
    }
    if (contactList && contactEntries.length > 3) {
      createSearchBar(contactList, "Buscar leads...", function (q, c) { filterListItems(contactList, q, c); });
    }
  }

  /* ── Event Handlers ── */

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    var email = document.querySelector("#admin-email").value.trim();
    var password = document.querySelector("#admin-password").value.trim();
    setButtonLoading(loginButton, true);
    setLoginStatus("Autenticando no Supabase...");
    try {
      await window.MarquesSupabase.signInWithPassword(email, password);
      var user = await window.MarquesSupabase.getUser();
      setAuthState(true, user);
      switchTab("settings");
      await loadAllData();
    } catch (error) {
      setAuthState(false);
      setLoginStatus(error.message || "Falha no login.", "error");
      showToast("Falha no login: " + (error.message || "verifique suas credenciais."), "error");
    } finally {
      setButtonLoading(loginButton, false);
    }
  });

  tabButtons.forEach(function (button) {
    button.addEventListener("click", function () { switchTab(button.dataset.adminTab); });
  });

  async function handleFormSubmit(form, submitFn, successMsg) {
    var submitBtn = form.querySelector("[type='submit']");
    setButtonLoading(submitBtn, true);
    var loadingToast = showToast("Salvando...", "loading");
    try {
      await submitFn();
      dismissToast(loadingToast);
      showToast(successMsg, "success");
      clearDirty();
    } catch (error) {
      dismissToast(loadingToast);
      showToast(error.message || "Falha ao salvar.", "error");
    } finally {
      setButtonLoading(submitBtn, false);
    }
  }

  settingsForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleFormSubmit(settingsForm, async function () {
      readFormIntoSnapshot(settingsForm);
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
    }, "Configuracoes salvas com sucesso.");
  });

  socialForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleFormSubmit(socialForm, async function () {
      readFormIntoSnapshot(socialForm);
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
    }, "Links das redes salvos com sucesso.");
  });

  contentForm.addEventListener("submit", function (event) {
    event.preventDefault();
    handleFormSubmit(contentForm, async function () {
      readFormIntoSnapshot(contentForm);
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
    }, "Conteudo das paginas salvo com sucesso.");
  });

  weeklyAnalysisForm?.addEventListener("submit", function (event) {
    event.preventDefault();
    handleFormSubmit(weeklyAnalysisForm, async function () {
      readWeeklyAnalysisFormIntoSnapshot();
      await window.MarquesSupabase.saveSiteSnapshot(snapshot);
      fillWeeklyAnalysisForm();
    }, "Analise da semana salva com sucesso.");
  });

  postForm.addEventListener("submit", function (event) {
    event.preventDefault();
    postForm.classList.add("admin-form-dirty");
    if (!postForm.checkValidity()) {
      showToast("Preencha todos os campos obrigatorios.", "error");
      return;
    }
    handleFormSubmit(postForm, async function () {
      await handleEditorialSubmit(postForm, postDraftState, { contentType: "news", previewElement: postCoverPreview });
      postForm.classList.remove("admin-form-dirty");
    }, "Noticia salva com sucesso.");
  });

  analysisForm.addEventListener("submit", function (event) {
    event.preventDefault();
    analysisForm.classList.add("admin-form-dirty");
    if (!analysisForm.checkValidity()) {
      showToast("Preencha todos os campos obrigatorios.", "error");
      return;
    }
    handleFormSubmit(analysisForm, async function () {
      await handleEditorialSubmit(analysisForm, analysisDraftState, {
        contentType: "analysis", source: "Analise Marques", previewElement: analysisCoverPreview,
      });
      analysisForm.classList.remove("admin-form-dirty");
    }, "Artigo da Analise Marques salvo com sucesso.");
  });

  agendaForm.addEventListener("submit", function (event) {
    event.preventDefault();
    agendaForm.classList.add("admin-form-dirty");
    if (!agendaForm.checkValidity()) {
      showToast("Preencha todos os campos obrigatorios.", "error");
      return;
    }
    handleFormSubmit(agendaForm, async function () {
      var formData = new FormData(agendaForm);
      await window.MarquesSupabase.saveAgendaEvent({
        id: formData.get("id"), title: formData.get("title"),
        summary: formData.get("summary"),
        event_at: fromDatetimeLocal(formData.get("event_at")),
        impact: formData.get("impact"), region: formData.get("region"),
        status: formData.get("status"),
      });
      resetAgendaForm();
      await loadCollections();
      agendaForm.classList.remove("admin-form-dirty");
    }, "Evento da agenda salvo com sucesso.");
  });

  postResetButton.addEventListener("click", function () { resetEditorialForm(postForm, postDraftState, postCoverPreview); });
  analysisResetButton.addEventListener("click", function () { resetEditorialForm(analysisForm, analysisDraftState, analysisCoverPreview); });
  agendaResetButton.addEventListener("click", resetAgendaForm);

  if (postTitleInput) {
    postTitleInput.addEventListener("input", function () {
      syncEditorialDerivedFields(postTitleInput, postSlugInput, postSeoTitleInput, postDraftState);
    });
  }

  if (analysisTitleInput) {
    analysisTitleInput.addEventListener("input", function () {
      syncEditorialDerivedFields(analysisTitleInput, analysisSlugInput, analysisSeoTitleInput, analysisDraftState);
    });
  }

  if (analysisTemplateButton) {
    analysisTemplateButton.addEventListener("click", function () {
      var contentField = analysisForm.querySelector("[name='content']");
      if (!contentField) return;
      if (contentField.value.trim()) {
        confirmDelete("o conteudo atual do artigo", "Sera substituido pelo modelo padrao Analise Marques.").then(function (ok) {
          if (!ok) return;
          contentField.value = ANALYSIS_TEMPLATE;
          if (!analysisForm.querySelector("[name='excerpt']").value.trim()) {
            analysisForm.querySelector("[name='excerpt']").value =
              "Resumo executivo com a tese central, o que mudou e a implicacao patrimonial da leitura.";
          }
          showToast("Modelo editorial Marques aplicado ao artigo.", "success");
        });
        return;
      }
      contentField.value = ANALYSIS_TEMPLATE;
      if (!analysisForm.querySelector("[name='excerpt']").value.trim()) {
        analysisForm.querySelector("[name='excerpt']").value =
          "Resumo executivo com a tese central, o que mudou e a implicacao patrimonial da leitura.";
      }
      showToast("Modelo editorial Marques aplicado ao artigo.", "success");
    });
  }

  attachCoverField(postForm, postCoverFileInput, postCoverUrlInput, postCoverAltInput, postCoverPreview, "Capa da noticia");
  attachCoverField(analysisForm, analysisCoverFileInput, analysisCoverUrlInput, analysisCoverAltInput, analysisCoverPreview, "Capa do artigo");
  attachPdfField(weeklyAnalysisPdfFileInput, weeklyAnalysisPdfUrlInput, weeklyAnalysisPdfFileNameInput, weeklyAnalysisPdfPreview, { label: "PDF da analise semanal" });

  refreshButton.addEventListener("click", async function () {
    setButtonLoading(refreshButton, true);
    await loadAllData();
    setButtonLoading(refreshButton, false);
  });

  logoutButton.addEventListener("click", function () {
    window.MarquesSupabase.signOut();
    setAuthState(false);
    showToast("Sessao encerrada.", "success");
    setPanelStatus("Sessao encerrada.");
  });

  async function handlePostListAction(event) {
    var editId = event.target.closest("[data-post-edit]")?.dataset.postEdit;
    var deleteId = event.target.closest("[data-post-delete]")?.dataset.postDelete;
    if (editId) { loadPostIntoForm(editId); return; }
    if (!deleteId) return;

    var post = posts.find(function (p) { return p.id === deleteId; });
    var confirmed = await confirmDelete(
      post?.title || "este post",
      "Categoria: " + (post?.category || "-") + " | Status: " + (post?.status || "-")
    );
    if (!confirmed) return;

    var loadingToast = showToast("Excluindo post...", "loading");
    try {
      await window.MarquesSupabase.deletePost(deleteId);
      await loadCollections();
      dismissToast(loadingToast);
      showToast("Post excluido com sucesso.", "success");
    } catch (error) {
      dismissToast(loadingToast);
      showToast(error.message || "Falha ao excluir o post.", "error");
    }
  }

  postList.addEventListener("click", handlePostListAction);
  analysisList.addEventListener("click", handlePostListAction);

  agendaList.addEventListener("click", async function (event) {
    var editId = event.target.closest("[data-agenda-edit]")?.dataset.agendaEdit;
    var deleteId = event.target.closest("[data-agenda-delete]")?.dataset.agendaDelete;
    if (editId) { loadAgendaIntoForm(editId); return; }
    if (!deleteId) return;

    var item = agendaItems.find(function (e) { return e.id === deleteId; });
    var confirmed = await confirmDelete(
      item?.title || "este evento",
      "Impacto: " + (item?.impact || "-") + " | Regiao: " + (item?.region || "-")
    );
    if (!confirmed) return;

    var loadingToast = showToast("Excluindo evento...", "loading");
    try {
      await window.MarquesSupabase.deleteAgendaEvent(deleteId);
      await loadCollections();
      dismissToast(loadingToast);
      showToast("Evento excluido com sucesso.", "success");
    } catch (error) {
      dismissToast(loadingToast);
      showToast(error.message || "Falha ao excluir o evento.", "error");
    }
  });

  document.addEventListener("click", function (event) {
    var socialButton = event.target.closest("[data-social-open]");
    if (!socialButton) return;
    var network = socialButton.dataset.socialOpen;
    var link = snapshot.settings?.socialLinks?.[network];
    if (!link) {
      showToast("Cadastre primeiro o link da rede " + network + " antes de abrir.", "error");
      return;
    }
    window.open(link, "_blank", "noopener,noreferrer");
  });

  /* Track form changes for unsaved warning */
  trackFormChanges(settingsForm);
  trackFormChanges(socialForm);
  trackFormChanges(contentForm);
  trackFormChanges(weeklyAnalysisForm);
  trackFormChanges(postForm);
  trackFormChanges(analysisForm);
  trackFormChanges(agendaForm);

  /* ── Init ── */

  (async function init() {
    if (!window.MarquesSupabase.isConfigured()) {
      configNote.hidden = false;
      loginButton.disabled = true;
      setAuthState(false);
      setPanelStatus("Preencha assets/js/supabase-config.js e aplique o schema SQL para ativar o painel online.");
      return;
    }

    configNote.hidden = true;
    loginButton.disabled = false;

    var user = await window.MarquesSupabase.getUser();
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
