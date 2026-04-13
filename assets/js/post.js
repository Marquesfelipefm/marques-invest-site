(function () {
  const articleShell = document.querySelector("#article-shell");

  if (!articleShell || !window.MarquesSupabase) {
    return;
  }

  const articleStatus = document.querySelector("#article-status");
  const articleHeader = document.querySelector("#article-header");
  const articleCategory = document.querySelector("#article-category");
  const articleMetaLine = document.querySelector("#article-meta-line");
  const articleTitle = document.querySelector("#article-title");
  const articleExcerpt = document.querySelector("#article-excerpt");
  const articleCover = document.querySelector("#article-cover");
  const articleContent = document.querySelector("#article-content");
  const articleShare = document.querySelector("#article-share");
  const articleShareActions = document.querySelector("#article-share-actions");
  const articleActions = document.querySelector("#article-actions");
  const articleEmpty = document.querySelector("#article-empty");
  const articleSourceCard = document.querySelector("#article-source-card");
  const articleSourceCopy = document.querySelector("#article-source-copy");
  const articleSourceLink = document.querySelector("#article-source-link");
  const relatedHeading = document.querySelector("#article-related-heading");
  const relatedTitle = relatedHeading?.querySelector("h2");
  const relatedGrid = document.querySelector("#article-related-grid");

  const categoryLabels = {
    latest: "Mais recentes",
    markets: "Mercado financeiro",
    companies: "Empresas",
    crypto: "Criptoativos",
  };
  const shareNetworks = [
    { key: "x", label: "X" },
    { key: "facebook", label: "Facebook" },
    { key: "instagram", label: "Instagram" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "youtube", label: "YouTube" },
  ];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getCategoryLabel(category) {
    return categoryLabels[category] || "Leitura editorial";
  }

  function normalizeText(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function inferPostType(post) {
    if (normalizeText(post?.content_type) === "newsletter") {
      return "newsletter";
    }

    if (normalizeText(post?.source) === "carta marques") {
      return "newsletter";
    }

    if (normalizeText(post?.content_type) === "analysis") {
      return "analysis";
    }

    if (normalizeText(post?.source) === "analise marques") {
      return "analysis";
    }

    return "news";
  }

  function formatPublishedAt(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Agora";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "long",
      timeStyle: "short",
    }).format(date);
  }

  function readSlug() {
    const params = new URLSearchParams(window.location.search);
    return (params.get("slug") || "").trim();
  }

  function setMeta(name, content) {
    if (!content) {
      return;
    }

    let tag = document.querySelector(`meta[name="${name}"]`);

    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("name", name);
      document.head.appendChild(tag);
    }

    tag.setAttribute("content", content);
  }

  function setOgMeta(property, content) {
    if (!content) return;
    let tag = document.querySelector(`meta[property="${property}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute("property", property);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  function updateSocialMeta(post) {
    var title = post.seo_title || (post.title + " | Marques Invest");
    var desc = post.seo_description || post.excerpt || post.title;
    var url = window.location.href;
    var image = post.cover_url || "https://marquesinvest.com/assets/img/marques-invest-logo-social.png";

    setOgMeta("og:title", title);
    setOgMeta("og:description", desc);
    setOgMeta("og:url", url);
    setOgMeta("og:image", image);
    setOgMeta("og:type", "article");

    setMeta("twitter:title", title);
    setMeta("twitter:description", desc);
    setMeta("twitter:image", image);
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

  function getShareLinks(post) {
    const articleUrl = encodeURIComponent(window.location.href);
    const articleTitle = encodeURIComponent(post.title || "Leitura Marques Invest");

    return {
      x: `https://twitter.com/intent/tweet?text=${articleTitle}&url=${articleUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${articleUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${articleUrl}`,
    };
  }

  function renderShareButtons(post) {
    const shareLinks = getShareLinks(post);

    return shareNetworks
      .map((network) => {
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
            data-article-copy="true"
            data-network="${network.label}"
            data-url="${window.location.href}"
            aria-label="Copiar link para compartilhar no ${network.label}"
            title="Copiar link para compartilhar no ${network.label}"
          >
            ${getShareIcon(network.key)}
          </button>
        `;
      })
      .join("");
  }

  function isHtmlContent(content) {
    return /<(?:p|h[1-6]|ul|ol|blockquote|div|br|strong|em|a)\b/i.test(content);
  }

  function sanitizeHtml(html) {
    var temp = document.createElement("div");
    temp.innerHTML = html;
    temp.querySelectorAll("script,iframe,object,embed,form").forEach(function (el) {
      el.remove();
    });
    return temp.innerHTML;
  }

  function renderRichText(content) {
    var raw = String(content || "").trim();

    if (!raw) {
      return "<p>Conteudo indisponivel no momento.</p>";
    }

    if (isHtmlContent(raw)) {
      return sanitizeHtml(raw);
    }

    const blocks = raw
      .split(/\n\s*\n/)
      .map((block) => block.trim())
      .filter(Boolean);

    if (!blocks.length) {
      return "<p>Conteudo indisponivel no momento.</p>";
    }

    return blocks
      .map((block) => {
        const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);

        if (lines.every((line) => line.startsWith("- "))) {
          return `
            <ul class="article-list">
              ${lines.map((line) => `<li>${escapeHtml(line.replace(/^- /, ""))}</li>`).join("")}
            </ul>
          `;
        }

        if (lines.length === 1 && /^##\s+/.test(lines[0])) {
          return `<h2>${escapeHtml(lines[0].replace(/^##\s+/, ""))}</h2>`;
        }

        if (lines.length === 1 && /^>\s+/.test(lines[0])) {
          return `<blockquote>${escapeHtml(lines[0].replace(/^>\s+/, ""))}</blockquote>`;
        }

        return `<p>${lines.map((line) => escapeHtml(line)).join("<br />")}</p>`;
      })
      .join("");
  }

  function renderRelatedPosts(posts, currentSlug, currentType) {
    if (!relatedGrid) {
      return;
    }

    const items = (posts || []).filter((item) => item.slug !== currentSlug).slice(0, 3);

    if (!items.length) {
      relatedHeading.hidden = true;
      relatedGrid.innerHTML = "";
      return;
    }

    relatedHeading.hidden = false;
    relatedGrid.innerHTML = items
      .map(
        (item) => `
          <article class="news-card article-related-card">
            ${
              item.cover_url
                ? `
                  <div class="news-card-cover">
                    <img
                      src="${escapeHtml(item.cover_url)}"
                      alt="${escapeHtml(item.cover_alt || `Capa da materia ${item.title}`)}"
                      loading="lazy"
                    />
                  </div>
                `
                : ""
            }
            <div class="news-meta">
              <span>${escapeHtml(item.source || "Marques Invest")}</span>
              <span>${escapeHtml(formatPublishedAt(item.published_at || item.created_at))}</span>
            </div>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.excerpt || "Leitura editorial indisponivel.")}</p>
              <div class="news-card-footer">
                <span class="news-category-chip">${escapeHtml(getCategoryLabel(item.category))}</span>
                <a class="news-link" href="noticia.html?slug=${encodeURIComponent(item.slug)}">${
                  currentType === "analysis" ? "Ler artigo" : "Ler materia"
                }</a>
              </div>
            </article>
        `
      )
      .join("");
  }

  function renderPost(post) {
    const postType = inferPostType(post);

    articleStatus.hidden = true;
    articleHeader.hidden = false;
    articleContent.hidden = false;
    articleActions.hidden = false;
    articleEmpty.hidden = true;

    articleCategory.textContent =
      postType === "analysis" ? "Analise Marques" : getCategoryLabel(post.category);
    articleMetaLine.textContent = `${post.source || (postType === "analysis" ? "Analise Marques" : "Marques Invest")} | ${formatPublishedAt(
      post.published_at || post.created_at
    )}`;
    articleTitle.textContent = post.title || "Leitura editorial";
    articleExcerpt.textContent = post.excerpt || "Conteudo editorial publicado pela Marques Invest.";
    articleContent.innerHTML = renderRichText(post.content || post.excerpt);

    if (post.cover_url) {
      articleCover.hidden = false;
      articleCover.innerHTML = `
        <img
          src="${escapeHtml(post.cover_url)}"
          alt="${escapeHtml(post.cover_alt || `Capa da materia ${post.title}`)}"
          loading="eager"
        />
      `;
    } else {
      articleCover.hidden = true;
      articleCover.innerHTML = "";
    }

    if (post.external_url) {
      articleSourceCard.hidden = false;
      articleSourceCopy.textContent = `Esta materia pode ser complementada pela referencia original associada a esta publicacao.`;
      articleSourceLink.href = post.external_url;
    } else {
      articleSourceCard.hidden = true;
      articleSourceLink.removeAttribute("href");
    }

    if (articleShare && articleShareActions) {
      articleShare.hidden = false;
      articleShareActions.innerHTML = renderShareButtons(post);
    }

    document.title = post.seo_title || `${post.title} | Marques Invest`;
    setMeta("description", post.seo_description || post.excerpt || post.title);
    updateSocialMeta(post);
  }

  function renderMissing() {
    articleStatus.hidden = true;
    articleHeader.hidden = true;
    articleCover.hidden = true;
    articleContent.hidden = true;
    if (articleShare) {
      articleShare.hidden = true;
    }
    articleActions.hidden = true;
    articleSourceCard.hidden = true;
    articleEmpty.hidden = false;
    relatedHeading.hidden = true;
    relatedGrid.innerHTML = "";
    document.title = "Materia nao encontrada | Marques Invest";
    setMeta("description", "A materia solicitada nao foi encontrada.");
  }

  async function init() {
    const slug = readSlug();

    if (!slug || !window.MarquesSupabase.isConfigured()) {
      renderMissing();
      return;
    }

    try {
      const post = await window.MarquesSupabase.getPublicPostBySlug(slug);

      if (!post) {
        renderMissing();
        return;
      }

      renderPost(post);

      try {
        const postType = inferPostType(post);
        if (relatedTitle) {
          relatedTitle.textContent =
            postType === "analysis"
              ? "Outros artigos da Analise Marques"
              : "Outras materias da mesma linha editorial";
        }
        const relatedPosts = await window.MarquesSupabase.listPublicPosts({
          category: postType === "analysis" ? null : post.category || "latest",
          contentType: postType,
          limit: 4,
        });
        renderRelatedPosts(relatedPosts, slug, postType);
      } catch (error) {
        relatedHeading.hidden = true;
        relatedGrid.innerHTML = "";
      }
    } catch (error) {
      renderMissing();
    }
  }

  articleShell.addEventListener("click", async (event) => {
    const copyButton = event.target.closest("[data-article-copy='true']");

    if (!copyButton) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copyButton.dataset.url || window.location.href);
      copyButton.title = `Link copiado para ${copyButton.dataset.network}`;
    } catch (error) {
      copyButton.title = "Nao foi possivel copiar o link";
    }
  });

  init();
})();
