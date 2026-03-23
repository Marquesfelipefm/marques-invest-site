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
  const postForm = document.querySelector("#admin-post-form");
  const postResetButton = document.querySelector("#admin-post-reset");
  const agendaForm = document.querySelector("#admin-agenda-form");
  const agendaResetButton = document.querySelector("#admin-agenda-reset");
  const refreshButton = document.querySelector("#admin-refresh");
  const logoutButton = document.querySelector("#admin-logout");
  const postList = document.querySelector("#admin-post-list");
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
  }

  function readFormIntoSnapshot(form) {
    if (!form) {
      return;
    }

    form.querySelectorAll("input[name], select[name], textarea[name]").forEach((field) => {
      assignPath(snapshot, field.name, field.value);
    });
  }

  function resetPostForm() {
    postForm.reset();
    postForm.querySelector("[name='id']").value = "";
  }

  function resetAgendaForm() {
    agendaForm.reset();
    agendaForm.querySelector("[name='id']").value = "";
  }

  function renderPosts() {
    metricPosts.textContent = String(posts.length);

    if (!posts.length) {
      postList.innerHTML = '<div class="admin-empty">Nenhum post cadastrado ainda.</div>';
      return;
    }

    postList.innerHTML = posts
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
              </div>
            </div>
            <div class="admin-item-meta">
              Fonte: ${escapeHtml(post.source || "Marques Invest")}<br />
              Publicacao: ${escapeHtml(formatDate(post.published_at || post.updated_at))}
            </div>
            <div class="admin-item-actions">
              <button type="button" class="button button-secondary" data-post-edit="${post.id}">Editar</button>
              <button type="button" class="button button-secondary" data-post-delete="${post.id}">Excluir</button>
            </div>
          </article>
        `
      )
      .join("");
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

  function loadPostIntoForm(id) {
    const item = posts.find((post) => post.id === id);

    if (!item) {
      return;
    }

    postForm.querySelector("[name='id']").value = item.id;
    postForm.querySelector("[name='title']").value = item.title || "";
    postForm.querySelector("[name='slug']").value = item.slug || "";
    postForm.querySelector("[name='category']").value = item.category || "markets";
    postForm.querySelector("[name='status']").value = item.status || "draft";
    postForm.querySelector("[name='source']").value = item.source || "";
    postForm.querySelector("[name='published_at']").value = toDatetimeLocal(item.published_at);
    postForm.querySelector("[name='external_url']").value = item.external_url || "";
    postForm.querySelector("[name='cover_url']").value = item.cover_url || "";
    postForm.querySelector("[name='excerpt']").value = item.excerpt || "";
    postForm.querySelector("[name='content']").value = item.content || "";
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

  postForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(postForm);
    const title = formData.get("title");
    const slug = formData.get("slug") || slugify(title);
    const status = formData.get("status");
    const publishedAt =
      status === "published"
        ? fromDatetimeLocal(formData.get("published_at")) || new Date().toISOString()
        : fromDatetimeLocal(formData.get("published_at"));

    try {
      await window.MarquesSupabase.savePost({
        id: formData.get("id"),
        title,
        slug,
        category: formData.get("category"),
        status,
        source: formData.get("source"),
        published_at: publishedAt,
        external_url: formData.get("external_url"),
        cover_url: formData.get("cover_url"),
        excerpt: formData.get("excerpt"),
        content: formData.get("content"),
      });

      resetPostForm();
      await loadCollections();
      setPanelStatus("Post salvo com sucesso.", "success");
    } catch (error) {
      setPanelStatus(error.message || "Falha ao salvar o post.", "error");
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

  postResetButton.addEventListener("click", resetPostForm);
  agendaResetButton.addEventListener("click", resetAgendaForm);

  refreshButton.addEventListener("click", async () => {
    await loadAllData();
  });

  logoutButton.addEventListener("click", () => {
    window.MarquesSupabase.signOut();
    setAuthState(false);
    setPanelStatus("Sessao encerrada.");
  });

  postList.addEventListener("click", async (event) => {
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
  });

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
