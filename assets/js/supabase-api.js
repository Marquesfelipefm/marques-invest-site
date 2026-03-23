(function () {
  const SESSION_KEY = "marques-supabase-session";

  function getConfig() {
    const config = window.MARQUES_SUPABASE_CONFIG || {};

    return {
      url: (config.url || "").trim().replace(/\/$/, ""),
      anonKey: (config.anonKey || "").trim(),
    };
  }

  function isConfigured() {
    const config = getConfig();
    return Boolean(config.url && config.anonKey);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    } catch (error) {
      return null;
    }
  }

  function normalizeSession(session) {
    if (!session) {
      return null;
    }

    const expiresAt =
      session.expires_at ||
      Math.floor(Date.now() / 1000) + Number(session.expires_in || 3600);

    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: expiresAt,
      token_type: session.token_type || "bearer",
      user: session.user || null,
    };
  }

  function setSession(session) {
    if (!session) {
      localStorage.removeItem(SESSION_KEY);
      window.dispatchEvent(new CustomEvent("marques-auth-change", { detail: null }));
      return null;
    }

    const normalized = normalizeSession(session);
    localStorage.setItem(SESSION_KEY, JSON.stringify(normalized));
    window.dispatchEvent(new CustomEvent("marques-auth-change", { detail: normalized }));
    return normalized;
  }

  function buildUrl(path, query = {}) {
    const { url } = getConfig();
    const nextUrl = new URL(`${url}${path}`);

    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      nextUrl.searchParams.set(key, value);
    });

    return nextUrl.toString();
  }

  function getErrorMessage(response, payload) {
    return (
      payload?.msg ||
      payload?.error_description ||
      payload?.message ||
      payload?.error ||
      `Supabase request failed (${response.status})`
    );
  }

  async function safeJson(response) {
    try {
      return await response.json();
    } catch (error) {
      return null;
    }
  }

  async function refreshSession() {
    const config = getConfig();
    const current = getSession();

    if (!config.url || !config.anonKey || !current?.refresh_token) {
      setSession(null);
      return null;
    }

    const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh_token: current.refresh_token,
      }),
    });

    const payload = await safeJson(response);

    if (!response.ok) {
      setSession(null);
      throw new Error(getErrorMessage(response, payload));
    }

    return setSession(payload);
  }

  async function getValidSession(requireAuth = false) {
    const current = getSession();

    if (!current) {
      if (requireAuth) {
        throw new Error("Sessao nao encontrada. Faca login no painel.");
      }

      return null;
    }

    if (current.expires_at && current.expires_at <= Math.floor(Date.now() / 1000) + 45) {
      return refreshSession();
    }

    return current;
  }

  async function request(path, options = {}) {
    const config = getConfig();

    if (!config.url || !config.anonKey) {
      throw new Error(
        "Supabase nao configurado. Preencha assets/js/supabase-config.js com URL e anon key."
      );
    }

    const {
      method = "GET",
      query,
      body,
      requireAuth = false,
      allowAuth = true,
      headers = {},
    } = options;

    const session = allowAuth ? await getValidSession(requireAuth) : null;
    const requestHeaders = {
      apikey: config.anonKey,
      ...headers,
    };

    if (body !== undefined) {
      requestHeaders["Content-Type"] = "application/json";
    }

    if (session?.access_token) {
      requestHeaders.Authorization = `Bearer ${session.access_token}`;
    }

    const response = await fetch(buildUrl(path, query), {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    const payload = await safeJson(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(response, payload));
    }

    return payload;
  }

  function buildFilterQuery(filters = []) {
    const query = {};

    filters.forEach((filter) => {
      if (!filter || !filter.column) {
        return;
      }

      query[filter.column] = `${filter.operator || "eq"}.${String(filter.value)}`;
    });

    return query;
  }

  async function list(table, options = {}) {
    const {
      select = "*",
      filters = [],
      order,
      limit,
      requireAuth = false,
    } = options;

    const query = {
      select,
      ...buildFilterQuery(filters),
    };

    if (order) {
      query.order = order;
    }

    if (limit) {
      query.limit = String(limit);
    }

    return request(`/rest/v1/${table}`, {
      query,
      requireAuth,
    });
  }

  async function insert(table, rows, options = {}) {
    const { select = "*", requireAuth = true } = options;

    return request(`/rest/v1/${table}`, {
      method: "POST",
      query: { select },
      body: rows,
      requireAuth,
      headers: {
        Prefer: "return=representation",
      },
    });
  }

  async function upsert(table, rows, options = {}) {
    const { select = "*", onConflict, requireAuth = true } = options;

    return request(`/rest/v1/${table}`, {
      method: "POST",
      query: {
        select,
        on_conflict: onConflict,
      },
      body: rows,
      requireAuth,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
    });
  }

  async function update(table, values, filters, options = {}) {
    const { select = "*", requireAuth = true } = options;

    return request(`/rest/v1/${table}`, {
      method: "PATCH",
      query: {
        select,
        ...buildFilterQuery(filters),
      },
      body: values,
      requireAuth,
      headers: {
        Prefer: "return=representation",
      },
    });
  }

  async function remove(table, filters, options = {}) {
    const { requireAuth = true } = options;

    return request(`/rest/v1/${table}`, {
      method: "DELETE",
      query: buildFilterQuery(filters),
      requireAuth,
      headers: {
        Prefer: "return=minimal",
      },
    });
  }

  async function signInWithPassword(email, password) {
    const config = getConfig();

    if (!config.url || !config.anonKey) {
      throw new Error(
        "Supabase nao configurado. Preencha assets/js/supabase-config.js com URL e anon key."
      );
    }

    const response = await fetch(`${config.url}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: config.anonKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const payload = await safeJson(response);

    if (!response.ok) {
      throw new Error(getErrorMessage(response, payload));
    }

    return setSession(payload);
  }

  async function getUser() {
    const session = await getValidSession(false);

    if (!session?.access_token) {
      return null;
    }

    try {
      const user = await request("/auth/v1/user", {
        requireAuth: true,
      });

      const nextSession = clone(session);
      nextSession.user = user;
      setSession(nextSession);
      return user;
    } catch (error) {
      setSession(null);
      return null;
    }
  }

  function signOut() {
    setSession(null);
  }

  async function loadSiteSnapshot() {
    const [settingsRows, contentRows] = await Promise.all([
      list("site_settings", {
        select: "id,whatsapp_link,social_links",
        limit: 1,
      }),
      list("site_content", {
        select: "key,value",
        order: "key.asc",
      }),
    ]);

    const settingsRow = Array.isArray(settingsRows) ? settingsRows[0] : null;
    const snapshot = {
      settings: {
        whatsappLink: settingsRow?.whatsapp_link || "#",
        socialLinks: settingsRow?.social_links || {
          x: "",
          facebook: "",
          instagram: "",
          linkedin: "",
          youtube: "",
        },
      },
    };

    (contentRows || []).forEach((row) => {
      snapshot[row.key] = row.value || {};
    });

    return snapshot;
  }

  async function saveSiteSnapshot(snapshot) {
    const settings = snapshot.settings || {};
    const sections = ["home", "analysis", "highlights", "newsletter", "contact"];
    const rows = sections.map((key) => ({
      key,
      value: snapshot[key] || {},
    }));

    await Promise.all([
      upsert(
        "site_settings",
        {
          id: 1,
          whatsapp_link: settings.whatsappLink || "#",
          social_links: settings.socialLinks || {},
        },
        { onConflict: "id" }
      ),
      upsert("site_content", rows, { onConflict: "key" }),
    ]);
  }

  async function listPublicPosts(category) {
    const filters = [{ column: "status", operator: "eq", value: "published" }];

    if (category && category !== "latest") {
      filters.push({ column: "category", operator: "eq", value: category });
    }

    return list("posts", {
      select:
        "id,title,slug,excerpt,content,category,source,external_url,cover_url,status,published_at,created_at,updated_at",
      filters,
      order: "published_at.desc",
      limit: 24,
    });
  }

  async function listAdminPosts() {
    return list("posts", {
      select:
        "id,title,slug,excerpt,content,category,source,external_url,cover_url,status,published_at,created_at,updated_at",
      order: "updated_at.desc",
      limit: 100,
      requireAuth: true,
    });
  }

  async function savePost(values) {
    const payload = {
      title: values.title,
      slug: values.slug,
      excerpt: values.excerpt,
      content: values.content,
      category: values.category,
      source: values.source,
      external_url: values.external_url || null,
      cover_url: values.cover_url || null,
      status: values.status,
      published_at: values.published_at || null,
    };

    if (values.id) {
      return update("posts", payload, [{ column: "id", value: values.id }], { requireAuth: true });
    }

    return insert("posts", payload, { requireAuth: true });
  }

  async function deletePost(id) {
    return remove("posts", [{ column: "id", value: id }], { requireAuth: true });
  }

  async function listPublicAgenda() {
    return list("agenda_events", {
      select: "id,title,summary,event_at,impact,region,status,created_at,updated_at",
      filters: [{ column: "status", operator: "eq", value: "published" }],
      order: "event_at.asc",
      limit: 30,
    });
  }

  async function listAdminAgenda() {
    return list("agenda_events", {
      select: "id,title,summary,event_at,impact,region,status,created_at,updated_at",
      order: "event_at.asc",
      limit: 100,
      requireAuth: true,
    });
  }

  async function saveAgendaEvent(values) {
    const payload = {
      title: values.title,
      summary: values.summary,
      event_at: values.event_at,
      impact: values.impact,
      region: values.region,
      status: values.status,
    };

    if (values.id) {
      return update(
        "agenda_events",
        payload,
        [{ column: "id", value: values.id }],
        { requireAuth: true }
      );
    }

    return insert("agenda_events", payload, { requireAuth: true });
  }

  async function deleteAgendaEvent(id) {
    return remove("agenda_events", [{ column: "id", value: id }], { requireAuth: true });
  }

  async function saveNewsletterSubscriber(values) {
    return insert(
      "newsletter_subscribers",
      {
        email: values.email,
        name: values.name || null,
        status: "active",
      },
      { requireAuth: false }
    );
  }

  async function listNewsletterSubscribers() {
    return list("newsletter_subscribers", {
      select: "id,email,name,status,created_at",
      order: "created_at.desc",
      limit: 200,
      requireAuth: true,
    });
  }

  async function saveContactLead(values) {
    const basePayload = {
      name: values.name,
      email: values.email,
      phone: values.phone,
      cep: values.cep,
      street: values.street,
      number: values.number,
      complement: values.complement || null,
      district: values.district,
      city: values.city,
      state: values.state,
      service: values.service,
      investment_range: values.investmentRange,
    };

    const extendedPayload = {
      ...basePayload,
      objective: values.objective || null,
      horizon: values.horizon || null,
      patrimony_band: values.patrimonyBand || null,
      already_invests: values.alreadyInvests || null,
    };

    try {
      return await insert("contact_leads", extendedPayload, { requireAuth: false });
    } catch (error) {
      const qualificationNotes = [
        values.objective ? `Objetivo: ${values.objective}` : "",
        values.horizon ? `Horizonte: ${values.horizon}` : "",
        values.patrimonyBand ? `Patrimonio: ${values.patrimonyBand}` : "",
        values.alreadyInvests ? `Ja investe: ${values.alreadyInvests}` : "",
      ]
        .filter(Boolean)
        .join(" | ");

      return insert(
        "contact_leads",
        {
          ...basePayload,
          complement: [values.complement || "", qualificationNotes].filter(Boolean).join(" | ") || null,
        },
        { requireAuth: false }
      );
    }
  }

  async function listContactLeads() {
    return list("contact_leads", {
      select:
        "id,name,email,phone,service,investment_range,city,state,created_at",
      order: "created_at.desc",
      limit: 200,
      requireAuth: true,
    });
  }

  window.MarquesSupabase = {
    getConfig,
    isConfigured,
    getSession,
    setSession,
    getUser,
    signInWithPassword,
    signOut,
    list,
    insert,
    upsert,
    update,
    remove,
    loadSiteSnapshot,
    saveSiteSnapshot,
    listPublicPosts,
    listAdminPosts,
    savePost,
    deletePost,
    listPublicAgenda,
    listAdminAgenda,
    saveAgendaEvent,
    deleteAgendaEvent,
    saveNewsletterSubscriber,
    listNewsletterSubscribers,
    saveContactLead,
    listContactLeads,
  };
})();
