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
  const articleActions = document.querySelector("#article-actions");
  const articleEmpty = document.querySelector("#article-empty");
  const articleSourceCard = document.querySelector("#article-source-card");
  const articleSourceCopy = document.querySelector("#article-source-copy");
  const articleSourceLink = document.querySelector("#article-source-link");
  const relatedHeading = document.querySelector("#article-related-heading");
  const relatedGrid = document.querySelector("#article-related-grid");

  const categoryLabels = {
    latest: "Mais recentes",
    markets: "Mercado financeiro",
    companies: "Empresas",
    crypto: "Criptoativos",
  };

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

  function renderRichText(content) {
    const blocks = String(content || "")
      .trim()
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

  function renderRelatedPosts(posts, currentSlug) {
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
                      alt="${escapeHtml(`Capa da materia ${item.title}`)}"
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
              <a class="news-link" href="noticia.html?slug=${encodeURIComponent(item.slug)}">Ler materia</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function renderPost(post) {
    articleStatus.hidden = true;
    articleHeader.hidden = false;
    articleContent.hidden = false;
    articleActions.hidden = false;
    articleEmpty.hidden = true;

    articleCategory.textContent = getCategoryLabel(post.category);
    articleMetaLine.textContent = `${post.source || "Marques Invest"} | ${formatPublishedAt(
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
          alt="${escapeHtml(`Capa da materia ${post.title}`)}"
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

    document.title = `${post.title} | Marques Invest`;
    setMeta("description", post.excerpt || post.title);
  }

  function renderMissing() {
    articleStatus.hidden = true;
    articleHeader.hidden = true;
    articleCover.hidden = true;
    articleContent.hidden = true;
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
        const relatedPosts = await window.MarquesSupabase.listPublicPosts(post.category || "latest");
        renderRelatedPosts(relatedPosts, slug);
      } catch (error) {
        relatedHeading.hidden = true;
        relatedGrid.innerHTML = "";
      }
    } catch (error) {
      renderMissing();
    }
  }

  init();
})();
