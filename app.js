const app = document.querySelector("#app");
const nav = document.querySelector("#main-nav");
const menuToggle = document.querySelector(".menu-toggle");
const footer = document.querySelector(".site-footer");
const brand = document.querySelector(".brand");

const iconMap = {
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  community: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
  message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z"/><path d="M8 9h8M8 13h5"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h6"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-7"/>',
  play: '<circle cx="12" cy="12" r="10"/><path d="M10 8l6 4-6 4z"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/>',
  calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  globe: '<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 0 20M12 2a15.3 15.3 0 0 0 0 20"/>',
  rocket: '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.7-.83.66-2.08-.08-2.82-.74-.74-1.99-.78-2.92-.18z"/><path d="M9 15l-1-1a12 12 0 0 1 11-11l1 1A12 12 0 0 1 9 15z"/><path d="M15 9h.01"/>',
  target: '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
  flag: '<path d="M4 22V4"/><path d="M4 4h14l-2 5 2 5H4"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
  handshake: '<path d="M11 17l2 2a3 3 0 0 0 4.2 0l3.6-3.6a3 3 0 0 0 0-4.2L17 7.4"/><path d="M13 7l-6 6 4 4 6-6"/><path d="M2 12l5-5 4 4M22 12l-5-5"/>',
  network: '<circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><circle cx="12" cy="18" r="3"/><path d="M8.5 7.5l2.5 7M15.5 7.5l-2.5 7M9 6h6"/>',
  megaphone: '<path d="M3 11v2a2 2 0 0 0 2 2h2l5 4V5L7 9H5a2 2 0 0 0-2 2z"/><path d="M16 9a5 5 0 0 1 0 6M19 6a9 9 0 0 1 0 12"/>',
};

const storageKey = "manssuetude_admin_content_v3";
const sessionKey = "manssuetude_admin_session";

const contentRepository = {
  load() {
    try {
      const saved = localStorage.getItem(storageKey);
      return normalizeCMS(saved ? JSON.parse(saved) : structuredClone(SITE_CONTENT));
    } catch {
      return normalizeCMS(structuredClone(SITE_CONTENT));
    }
  },
  save(content) {
    localStorage.setItem(storageKey, JSON.stringify(content));
  },
  reset() {
    localStorage.removeItem(storageKey);
  },
  export() {
    return JSON.stringify(CMS, null, 2);
  },
  import(raw) {
    CMS = normalizeCMS(JSON.parse(raw));
    this.save(CMS);
  },
};

const formRepository = {
  list() {
    return collection("formSubmissions");
  },
  create(formType, data) {
    const submission = {
      id: `submission-${Date.now()}`,
      formType,
      status: "reçu",
      receivedAt: new Date().toISOString(),
      notes: "",
      data,
    };
    this.list().unshift(submission);
    saveContent();
    return submission;
  },
};

const authRepository = {
  isAuthenticated() {
    return sessionStorage.getItem(sessionKey) === "true";
  },
  login(password) {
    const ok = password === (CMS.settings?.adminPassword || "manssuetude-admin");
    if (ok) sessionStorage.setItem(sessionKey, "true");
    return ok;
  },
  logout() {
    sessionStorage.removeItem(sessionKey);
  },
};

let CMS = loadContent();

function loadContent() {
  return contentRepository.load();
}

function saveContent() {
  contentRepository.save(CMS);
}

function normalizeCMS(content) {
  content.collections ||= {};
  content.collections.formSubmissions ||= [];
  content.settings ||= {};
  content.settings.adminPassword ||= "manssuetude-admin";
  content.settings.hideUnvalidatedStats ??= true;
  content.settings.roles ||= ["admin", "editor", "contributor", "viewer"];
  content.pages.activites ||= content.pages["activités"];
  delete content.pages["activités"];
  content.ctaLinks ||= {};
  Object.assign(content.ctaLinks, {
    donate: "FORM:don",
    partner: "FORM:partner",
    contribution: "FORM:content",
    projectProposal: "FORM:project",
    memberApplication: "FORM:join",
  });
  content.collections.resources = (content.collections.resources || []).map((item) => ({
    source: "upload",
    mimeType: mediaMime(item),
    previewUrl: item.previewUrl || item.url || "",
    thumbnailUrl: item.thumbnailUrl || (item.type === "image" ? item.url : ""),
    description: item.description || item.caption || "",
    visibility: item.visibility || "public",
    uploadedAt: item.uploadedAt || new Date().toISOString().slice(0, 10),
    updatedAt: item.updatedAt || item.uploadedAt || new Date().toISOString().slice(0, 10),
    relatedContent: item.relatedContent || [],
    ...item,
  }));
  return content;
}

function applySiteIdentity() {
  document.documentElement.style.setProperty("--orange", CMS.meta.colors?.primary || "#ff4d12");
  document.documentElement.style.setProperty("--ink", CMS.meta.colors?.secondary || "#0d0d0f");
  document.querySelector('link[rel="icon"]')?.setAttribute("href", CMS.meta.favicon || "assets/photos/favicon.png");
  if (!brand) return;
  brand.innerHTML = `
    <img class="brand-logo" src="${CMS.meta.logo}" alt="${escapeHtml(CMS.meta.name)}" />
    <span class="brand-text">
      <span class="brand-name">${escapeHtml(CMS.meta.name)}</span>
      <span class="brand-tagline">${CMS.meta.tagline}</span>
    </span>
  `;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function mediaMime(item = {}) {
  const ext = String(item.filename || item.url || "").split(".").pop().toLowerCase();
  const map = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", svg: "image/svg+xml",
    pdf: "application/pdf", doc: "application/msword", docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel", xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ppt: "application/vnd.ms-powerpoint", pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    mp4: "video/mp4", mov: "video/quicktime", mp3: "audio/mpeg", wav: "audio/wav", zip: "application/zip",
  };
  return item.mimeType || map[ext] || "application/octet-stream";
}

function mediaKind(fileName = "") {
  const ext = String(fileName).split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png", "webp", "svg"].includes(ext)) return "image";
  if (["mp4", "mov"].includes(ext)) return "video";
  if (["mp3", "wav"].includes(ext)) return "audio";
  if (ext === "pdf") return "pdf";
  if (["zip"].includes(ext)) return "archive";
  return "document";
}

function ctaUrl(keyOrUrl) {
  return CMS.ctaLinks[keyOrUrl] || keyOrUrl || "#accueil";
}

function bindCtaActions(root = document) {
  root.querySelectorAll('a[href^="FORM:"], button[data-open-form]').forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      const value = node.dataset.openForm || node.getAttribute("href")?.replace("FORM:", "");
      openForm(value);
    });
  });
}

function collection(name) {
  return CMS.collections[name] || [];
}

function byId(name, id) {
  return collection(name).find((item) => item.id === id);
}

function bySlug(name, slug) {
  return collection(name).find((item) => item.slug === slug);
}

function publicItems(name) {
  return collection(name).filter((item) => item.status === "published" || item.published);
}

function itemRoute(type, item) {
  const routes = {
    themes: "themes",
    productions: "productions",
    activities: "activites",
    projects: "projets",
    resources: "ressources",
  };
  return `#${routes[type]}/${item.slug}`;
}

function navLink(item) {
  if (item.hidden) return "";
  return `<a href="${item.route}" data-route="${item.id}" ${item.cta ? 'class="nav-cta"' : ""}>${escapeHtml(item.label)}</a>`;
}

function paintNav(active) {
  nav.innerHTML = CMS.nav.map(navLink).join("");
  nav.querySelectorAll("a").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === active);
  });
}

function parseRoute() {
  const raw = location.hash.replace("#", "") || "accueil";
  const [base, slug, action] = raw.split("/");
  return { raw, base, slug, action };
}

function accentTitle(title, accent) {
  if (!accent || !title.includes(accent)) return escapeHtml(title);
  return escapeHtml(title).replace(escapeHtml(accent), `<span>${escapeHtml(accent)}</span>`);
}

function icon(name) {
  return `<svg class="icon-svg" viewBox="0 0 24 24" aria-hidden="true">${iconMap[name] || iconMap.target}</svg>`;
}

function tagList(tags = []) {
  return tags.length ? `<div class="tags">${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}</div>` : "";
}

function updateSeo(page) {
  if (!page?.seo) {
    document.title = "Manssuétude";
    return;
  }
  document.title = page.seo.title;
  document.querySelector('meta[name="description"]')?.setAttribute("content", page.seo.description || "");
  document.querySelector('meta[property="og:title"]')?.setAttribute("content", page.seo.title || CMS.meta.name);
  document.querySelector('meta[property="og:description"]')?.setAttribute("content", page.seo.description || "");
  document.querySelector('meta[property="og:image"]')?.setAttribute("content", page.seo.image || CMS.meta.logo);
}

function searchIndex() {
  return [
    ...collection("themes").map((item) => ({ ...item, kind: "Thème", url: itemRoute("themes", item), haystack: [item.title, item.description, item.longDescription, ...(item.tags || [])].join(" ") })),
    ...collection("productions").map((item) => ({ ...item, kind: "Production", url: itemRoute("productions", item), haystack: [item.title, item.description, item.type, item.author, ...(item.tags || [])].join(" ") })),
    ...collection("activities").map((item) => ({ ...item, kind: "Activité", url: itemRoute("activities", item), haystack: [item.title, item.description, item.format, item.progressStatus, ...(item.relatedThemes || [])].join(" ") })),
    ...collection("projects").map((item) => ({ ...item, kind: "Projet", url: itemRoute("projects", item), haystack: [item.title, item.description, item.category, item.priority, item.progressStatus, ...(item.relatedThemes || [])].join(" ") })),
    ...collection("resources").map((item) => ({ ...item, kind: "Ressource", url: itemRoute("resources", item), haystack: [item.title, item.filename, item.type, item.caption, ...(item.tags || [])].join(" ") })),
  ];
}

function globalSearch() {
  return `
    <section class="global-search" role="search">
      <label for="site-search">Recherche globale</label>
      <div>
        <input id="site-search" type="search" placeholder="Rechercher un thème, une production, un projet, une ressource..." />
        <button type="button" data-search-clear>Effacer</button>
      </div>
      <div id="search-results" class="search-results" aria-live="polite"></div>
    </section>
  `;
}

function bindSearch() {
  const input = document.querySelector("#site-search");
  const output = document.querySelector("#search-results");
  if (!input || !output) return;

  input.addEventListener("input", () => {
    const query = input.value.trim().toLowerCase();
    if (query.length < 2) {
      output.innerHTML = "";
      return;
    }
    const results = searchIndex().filter((item) => item.haystack.toLowerCase().includes(query)).slice(0, 12);
    const groups = results.reduce((acc, item) => {
      acc[item.kind] ||= [];
      acc[item.kind].push(item);
      return acc;
    }, {});
    output.innerHTML = Object.entries(groups).map(([kind, items]) => `
      <div>
        <h3>${kind}</h3>
        ${items.map((item) => `<a href="${item.url}"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.description || item.caption || "")}</span></a>`).join("")}
      </div>
    `).join("") || "<p>Aucun resultat trouve.</p>";
  });

  document.querySelector("[data-search-clear]")?.addEventListener("click", () => {
    input.value = "";
    output.innerHTML = "";
  });
}

function hero(page) {
  const pageStats = CMS.settings?.hideUnvalidatedStats ? [] : page.stats;
  const stats = pageStats || (page.type === "home" && CMS.homepageConfig.showStats ? CMS.homepageConfig.stats : []);
  return `
    <section class="hero">
      <div class="hero-copy">
        <p class="eyebrow">${escapeHtml(page.eyebrow)}</p>
        <h1>${accentTitle(page.title, page.accent)}</h1>
        <span class="rule"></span>
        <p>${escapeHtml(page.body)}</p>
        <div class="actions">
          <a class="button primary" href="${ctaUrl(page.primary?.ctaKey)}">${escapeHtml(page.primary?.label || "Rejoindre")}</a>
          <a class="button secondary" href="${ctaUrl(page.secondary?.ctaKey)}">${escapeHtml(page.secondary?.label || "En savoir plus")}</a>
        </div>
      </div>
      <div class="hero-visual">
        <img src="${page.image || CMS.meta.fallbackImage}" alt="${escapeHtml(page.imageAlt || page.title)}" loading="lazy" onerror="this.src='${CMS.meta.fallbackImage}'" />
        ${page.quote ? `<blockquote>${escapeHtml(page.quote)}</blockquote>` : ""}
      </div>
    </section>
    ${stats?.length ? statsStrip(stats) : ""}
  `;
}

function statsStrip(stats) {
  return `<section class="stats">${stats.map((stat) => `
    <article>
      <i>${icon(stat.icon)}</i>
      <strong>${escapeHtml(stat.value)}</strong>
      <span>${escapeHtml(stat.label)}</span>
    </article>
  `).join("")}</section>`;
}

function card({ title, text, iconName, image, meta, url, tags, status }) {
  return `
    <article class="card">
      ${image ? `<a class="card-image" href="${url}"><img src="${image}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.src='${CMS.meta.fallbackImage}'" /></a>` : ""}
      <div class="card-body">
        ${iconName ? `<i>${icon(iconName)}</i>` : ""}
        ${meta ? `<p class="meta">${escapeHtml(meta)}</p>` : ""}
        <h3><a href="${url}">${escapeHtml(title)}</a></h3>
        <p>${escapeHtml(text)}</p>
        ${tagList(tags)}
        ${status && status !== "published" ? `<p class="status-pill">${escapeHtml(status)}</p>` : ""}
        <a class="text-link" href="${url}">Explorer <span>→</span></a>
      </div>
    </article>
  `;
}

function filterBar(page, collectionName) {
  const fields = page.filters || [];
  if (!fields.length) return "";
  return `<div class="filters" data-filter-collection="${collectionName}">
    <button type="button" data-filter-field="all" data-filter-value="all">Tous</button>
    ${fields.map((field) => {
      const values = [...new Set(collection(collectionName).flatMap((item) => {
        if (field === "theme") return item.relatedThemes || [];
        const value = item[field];
        return Array.isArray(value) ? value : [value].filter(Boolean);
      }))];
      return values.map((value) => `<button type="button" data-filter-field="${field}" data-filter-value="${escapeHtml(value)}">${escapeHtml(labelFor(value))}</button>`).join("");
    }).join("")}
  </div>`;
}

function bindFilters() {
  document.querySelectorAll("[data-filter-collection]").forEach((bar) => {
    bar.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const field = button.dataset.filterField;
      const value = button.dataset.filterValue;
      bar.querySelectorAll("button").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
      document.querySelectorAll("[data-filter-card]").forEach((cardNode) => {
        if (field === "all") {
          cardNode.hidden = false;
          return;
        }
        const values = (cardNode.dataset[field] || "").split("|");
        cardNode.hidden = !values.includes(value);
      });
    });
  });
}

function labelFor(id) {
  return byId("themes", id)?.shortTitle || id.replaceAll("-", " ");
}

function themeCards() {
  return `<div class="card-grid">${publicItems("themes").map((item) => `
    <div data-filter-card data-status="${item.status}" data-tag="${(item.tags || []).join("|")}">
      ${card({
        title: item.title,
        text: item.description,
        image: item.thumbnail,
        iconName: "target",
        url: itemRoute("themes", item),
        tags: item.tags,
      })}
    </div>
  `).join("")}</div>`;
}

function productionCards(items = publicItems("productions")) {
  return `<div class="card-grid catalog-grid">${items.map((item) => `
    <div data-filter-card data-type="${item.type}" data-theme="${(item.relatedThemes || []).join("|")}" data-tag="${(item.tags || []).join("|")}" data-author="${item.author}">
      ${card({
        meta: item.type,
        title: item.title,
        text: item.description,
        image: item.thumbnail,
        url: itemRoute("productions", item),
        tags: item.tags,
        status: item.status,
      })}
      <p class="download">${escapeHtml(item.date || "")} · ${escapeHtml(item.pages || item.readingTime || "")} ${item.fileUrl ? `<a href="${item.fileUrl}" download>Télécharger</a>` : ""}</p>
    </div>
  `).join("")}</div>`;
}

function activityCards(items = publicItems("activities")) {
  return `<div class="card-grid">${items.map((item) => `
    <div data-filter-card data-format="${item.format}" data-progressStatus="${item.progressStatus}" data-theme="${(item.relatedThemes || []).join("|")}">
      ${card({
        meta: item.progressStatus,
        title: item.title,
        text: item.description,
        image: item.gallery?.[0],
        iconName: "calendar",
        url: itemRoute("activities", item),
        tags: [item.format, item.progressStatus],
        status: item.status,
      })}
    </div>
  `).join("")}</div>`;
}

function projectCards(items = publicItems("projects")) {
  return `<div class="card-grid catalog-grid">${items.map((item) => `
    <div data-filter-card data-progressStatus="${item.progressStatus}" data-category="${item.category}" data-priority="${item.priority}" data-theme="${(item.relatedThemes || []).join("|")}">
      ${card({
        meta: `${item.category} · ${item.priority}`,
        title: item.title,
        text: item.description,
        image: projectImage(item),
        iconName: "rocket",
        url: itemRoute("projects", item),
        tags: [item.progressStatus, item.priority],
        status: item.status,
      })}
    </div>
  `).join("")}</div>`;
}

function resourceCards(items = publicItems("resources")) {
  return `<div class="card-grid">${items.map((item) => `
    <div data-filter-card data-type="${item.type}" data-tag="${(item.tags || []).join("|")}">
      ${card({
        meta: item.type,
        title: item.title,
        text: item.caption,
        iconName: "file",
        url: itemRoute("resources", item),
        tags: item.tags,
        status: item.status,
      })}
    </div>
  `).join("")}</div>`;
}

function projectImage(item) {
  const theme = byId("themes", item.relatedThemes?.[0]);
  return theme?.thumbnail || "assets/photos/hero-projets.png";
}

function methodBlock() {
  const block = CMS.pageBlocks.method;
  return `<div class="method-strip">${block.items.map((item) => `
    <article>
      <strong>${escapeHtml(item.letter)}</strong>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.text)}</p>
      <a href="#perca">En savoir plus →</a>
    </article>
  `).join("")}</div>`;
}

function currentPanel() {
  const block = CMS.pageBlocks.current;
  const items = CMS.homepageConfig.currentItems.map((id) =>
    byId("activities", id) || byId("resources", id) || byId("projects", id) || byId("productions", id)
  ).filter(Boolean);
  return `<div class="two-col">
    <section class="panel">
      <p class="eyebrow">${escapeHtml(block.eyebrow)}</p>
      <h2>${escapeHtml(block.title)}</h2>
      ${items.map((item) => `<a class="list-row" href="${routeForAny(item)}"><span>${escapeHtml(item.progressStatus || item.type || item.category || "En cours")}</span>${escapeHtml(item.title)}<b>→</b></a>`).join("")}
    </section>
    <section class="soft-panel">
      <p class="eyebrow">A retenir</p>
      <h2>${escapeHtml(block.noteTitle)}</h2>
      <ul>${block.notes.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}</ul>
    </section>
  </div>`;
}

function routeForAny(item) {
  if (collection("themes").some((x) => x.id === item.id)) return itemRoute("themes", item);
  if (collection("productions").some((x) => x.id === item.id)) return itemRoute("productions", item);
  if (collection("activities").some((x) => x.id === item.id)) return itemRoute("activities", item);
  if (collection("projects").some((x) => x.id === item.id)) return itemRoute("projects", item);
  return itemRoute("resources", item);
}

function sectionBlock(section, page) {
  const title = section.title ? `<div class="section-heading"><h2>${escapeHtml(section.title)}</h2></div>` : "";
  let body = "";

  switch (section.type) {
    case "featuredProductions":
      body = productionCards(CMS.homepageConfig.featuredProductions.map((id) => byId("productions", id)).filter(Boolean));
      break;
    case "current":
      body = currentPanel();
      break;
    case "method":
      body = methodBlock();
      break;
    case "themesGrid":
      body = filterBar(page, "themes") + themeCards();
      break;
    case "approach":
      body = approachBlock();
      break;
    case "activityFormats":
      body = supportGrid([
        { icon: "message", title: "Débats & conférences", text: "Échanger des idées et confronter les points de vue.", cta: "Voir les activités", ctaKey: "activities" },
        { icon: "users", title: "Ateliers & séances", text: "Approfondir un sujet et produire des idées actionnables.", cta: "Participer", ctaKey: "join" },
        { icon: "book", title: "Formations", text: "Développer des compétences avec des experts.", cta: "Rejoindre", ctaKey: "join" },
        { icon: "network", title: "Rencontres", text: "Créer des connexions et collaborations.", cta: "Découvrir", ctaKey: "activities" },
      ]);
      break;
    case "activitiesList":
      body = filterBar(page, "activities") + activityCards();
      break;
    case "productionsCatalog":
      body = filterBar(page, "productions") + productionCards();
      break;
    case "productionCta":
      body = splitCta("Une ressource, un impact.", "Les productions sont libres d'accès et conçues pour etre partagées.", "Vous avez une expertise a partager ?", "Contribuez a nos productions et participez a la construction d'une connaissance collective.");
      break;
    case "projectsCatalog":
      body = filterBar(page, "projects") + projectCards();
      break;
    case "commitments":
      body = splitCta("Vous avez une idée de projet a fort impact ?", "Soumettez votre projet et collaborons pour construire des solutions durables.", "Nos engagements", "Impact mesurable, collaboration exigeante et transparence dans les resultats.");
      break;
    case "pillars":
      body = supportGrid([
        { icon: "book", title: "Penser", text: "Prendre du recul, lire, analyser, construire une position.", cta: "Explorer", ctaKey: "productions" },
        { icon: "message", title: "Exprimer", text: "Mettre les idées en débat et apprendre à les formuler.", cta: "Rejoindre", ctaKey: "join" },
        { icon: "network", title: "Relier", text: "Créer des ponts entre personnes, ressources et projets.", cta: "Voir les projets", ctaKey: "projects" },
        { icon: "rocket", title: "Concrétiser & ancrer", text: "Transformer les réflexions en productions et formats utiles.", cta: "À propos", ctaKey: "about" },
      ]);
      break;
    case "partners":
      body = `<div class="soft-panel"><p class="eyebrow">Partenariats</p><h2>Les partenaires réels seront ajoutés ici lorsque les collaborations seront confirmées.</h2><p>Cette zone reste administrable pour éviter les logos ou soutiens fictifs.</p></div>`;
      break;
    case "mission":
      body = featurePanel(CMS.pageBlocks.mission.title, CMS.pageBlocks.mission.cards);
      break;
    case "timeline":
      body = `<div class="timeline">${CMS.pageBlocks.timeline.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`;
      break;
    case "domains":
      body = themeCards();
      break;
    case "impact":
      body = featurePanel("Chaque soutien renforce notre capacité d'action.", [
        { icon: "book", title: "Informer & éclairer", text: "Produire des analyses et contenus pour comprendre les enjeux." },
        { icon: "message", title: "Éduquer & sensibiliser", text: "Organiser débats, ateliers et formations." },
        { icon: "rocket", title: "Inspirer & mobiliser", text: "Donner la parole aux jeunes et valoriser leurs idées." },
        { icon: "network", title: "Relier & coopérer", text: "Créer des ponts entre acteurs engagés." },
      ]);
      break;
    case "supportWays":
      body = supportGrid(CMS.pageBlocks.supportWays);
      break;
    case "joinWho":
      body = supportGrid([
        { icon: "book", title: "Étudiants", text: "Apprendre, produire et contribuer aux séances.", cta: "Devenir membre", ctaKey: "memberApplication" },
        { icon: "users", title: "Jeunes professionnels", text: "Mettre des compétences au service d'idées utiles.", cta: "Rejoindre", ctaKey: "memberApplication" },
        { icon: "heart", title: "Créatifs & citoyens", text: "Proposer des formats, des contenus et des liens.", cta: "Proposer un contenu", ctaKey: "contribution" },
        { icon: "network", title: "Organisations", text: "Construire une collaboration sans posture institutionnelle forcée.", cta: "Devenir partenaire", ctaKey: "partner" },
      ]);
      break;
    case "trust":
      body = `<div class="two-col"><section><p class="eyebrow">Transparence & confiance</p><h2>Une gestion rigoureuse des ressources confiées.</h2><ul><li>Utilisation responsable des fonds</li><li>Suivi régulier des activités</li><li>Reporting et évaluation d'impact</li></ul></section><section class="dark-card"><h2>Utilisation des fonds</h2><p>Les pourcentages seront publiés lorsqu'ils seront réellement validés. En attendant, ce bloc sert à expliquer les principes de transparence.</p></section></div>`;
      break;
    case "joinSteps":
      body = `<div class="steps">${["Creez votre compte", "Completez votre profil", "Engagez-vous", "Passez a l'action"].map((item, index) => `<article><i>${index + 1}</i><h3>${escapeHtml(item)}</h3><p>Une etape simple pour rejoindre la dynamique collective.</p></article>`).join("")}</div>`;
      break;
    case "formsHub":
      body = supportGrid([
        { icon: "users", title: "Devenir membre", text: "Ouvrir le formulaire rejoindre.", cta: "Ouvrir", ctaKey: "memberApplication" },
        { icon: "rocket", title: "Proposer un projet", text: "Soumettre une idée ou une initiative.", cta: "Ouvrir", ctaKey: "projectProposal" },
        { icon: "file", title: "Proposer un contenu", text: "Partager une note, un article ou une ressource.", cta: "Ouvrir", ctaKey: "contribution" },
        { icon: "handshake", title: "Partenariat", text: "Initier une collaboration.", cta: "Ouvrir", ctaKey: "partner" },
      ]);
      break;
    case "form":
      body = supportGrid([{ icon: "message", title: CMS.pageBlocks.forms[section.form]?.title || "Formulaire", text: "Ce formulaire s'ouvre maintenant dans une modale dédiée.", cta: "Ouvrir", ctaKey: section.form === "partner" ? "partner" : "contribution" }]);
      break;
  }

  return `<section class="content-section">${title}${body}</section>`;
}

function supportGrid(items) {
  return `<div class="card-grid">${items.map((item) => card({
    title: item.title,
    text: item.text,
    iconName: item.icon,
    url: ctaUrl(item.ctaKey || "join"),
    meta: item.cta,
  })).join("")}</div>`;
}

function featurePanel(title, cards) {
  return `<div class="feature-panel"><div><p class="eyebrow">A retenir</p><h2>${escapeHtml(title)}</h2></div>${cards.map((item) => `<article><i>${icon(item.icon)}</i><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p></article>`).join("")}</div>`;
}

function approachBlock() {
  const block = CMS.pageBlocks.approach;
  return `<section class="dark-band"><div><p class="eyebrow">${escapeHtml(block.eyebrow)}</p><h2>${escapeHtml(block.title)}</h2><p>${escapeHtml(block.text)}</p></div>${supportGrid(block.items.map((item) => ({ ...item, icon: "target", ctaKey: "perca" })))}</section>`;
}

function splitCta(leftTitle, leftText, rightTitle, rightText) {
  return `<div class="split-cta"><div><h2>${escapeHtml(leftTitle)}</h2><p>${escapeHtml(leftText)}</p><a class="button secondary" href="${ctaUrl("productions")}">Explorer</a></div><div class="dark-card"><h2>${escapeHtml(rightTitle)}</h2><p>${escapeHtml(rightText)}</p><a class="button primary" href="${ctaUrl("contribution")}">Participer</a></div></div>`;
}

function formPreview(form) {
  const formId = Object.entries(CMS.pageBlocks.forms).find(([, value]) => value === form)?.[0] || "formulaire";
  return `<form class="cms-form" data-demo-form="${formId}">
    <h2>${escapeHtml(form.title)}</h2>
    <div class="form-grid">${form.fields.map((field) => {
      const lower = field.toLowerCase();
      const type = lower.includes("email") ? "email" : lower.includes("téléphone") ? "tel" : lower.includes("fichier") ? "file" : lower.includes("consentement") ? "checkbox" : "text";
      if (type === "checkbox") return `<label class="check-field"><input name="${escapeHtml(field)}" type="checkbox" required /><span>${escapeHtml(field)}</span></label>`;
      return `<label><span>${escapeHtml(field)}</span><input name="${escapeHtml(field)}" type="${type}" placeholder="${type === "file" ? "" : escapeHtml(field)}" ${lower.includes("email") ? "required" : ""} /></label>`;
    }).join("")}</div>
    <button class="button primary" type="submit">Envoyer la demande</button>
  </form>`;
}

function openForm(formId) {
  const form = CMS.pageBlocks.forms[formId];
  if (!form) return;
  closeModal();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" data-modal-backdrop>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <button class="modal-close" type="button" data-close-modal aria-label="Fermer le formulaire">×</button>
        <p class="eyebrow">Formulaire Manssuétude</p>
        <div id="modal-form-host">${formPreview(form)}</div>
      </section>
    </div>
  `);
  const modal = document.querySelector(".modal-backdrop");
  modal.querySelector(".cms-form h2").id = "modal-title";
  bindDemoForms(modal);
  modal.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-backdrop]")) closeModal();
  });
  modal.querySelector("input, textarea, select")?.focus();
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

function contentBlocks(blocks = []) {
  return blocks.map((block) => {
    if (block.type === "heading") return `<h2>${escapeHtml(block.value)}</h2>`;
    if (block.type === "paragraph") return `<p>${escapeHtml(block.value)}</p>`;
    if (block.type === "quote") return `<blockquote>${escapeHtml(block.value)}</blockquote>`;
    if (block.type === "image") return `<figure><img src="${block.src}" alt="${escapeHtml(block.caption || "")}" /><figcaption>${escapeHtml(block.caption || "")}</figcaption></figure>`;
    if (block.type === "file") return `<a class="button secondary" href="${block.url}" download>${escapeHtml(block.label || "Télécharger")}</a>`;
    if (block.type === "video") return `<div class="video-box"><iframe src="${block.url}" title="${escapeHtml(block.label || "Video")}" loading="lazy" allowfullscreen></iframe></div>`;
    return "";
  }).join("");
}

function relatedSection(item) {
  const relatedThemes = (item.relatedThemes || []).map((id) => byId("themes", id)).filter(Boolean);
  const relatedProductions = (item.relatedProductions || []).map((id) => byId("productions", id)).filter(Boolean);
  const relatedProjects = (item.relatedProjects || []).map((id) => byId("projects", id)).filter(Boolean);
  const relatedActivities = (item.relatedActivities || []).map((id) => byId("activities", id)).filter(Boolean);
  const resources = (item.resources || item.documents || []).map((id) => byId("resources", id)).filter(Boolean);
  const groups = [
    ["Thèmes liés", relatedThemes, "themes"],
    ["Productions liées", relatedProductions, "productions"],
    ["Projets liés", relatedProjects, "projects"],
    ["Activités liées", relatedActivities, "activities"],
    ["Fichiers associés", resources, "resources"],
  ].filter(([, items]) => items.length);

  return groups.length ? `<section class="content-section related">
    <div class="section-heading"><h2>Contenus liés</h2></div>
    ${groups.map(([title, items, type]) => `<div class="related-group"><h3>${title}</h3>${items.map((related) => `<a href="${itemRoute(type, related)}">${escapeHtml(related.title)} <span>→</span></a>`).join("")}</div>`).join("")}
  </section>` : "";
}

function detailPage(type, item) {
  if (!item) return notFound();
  const image = item.heroImage || item.thumbnail || item.gallery?.[0] || projectImage(item);
  const page = {
    eyebrow: type.slice(0, -1),
    title: item.title,
    accent: item.shortTitle,
    body: item.longDescription || item.description || item.content || item.caption || "",
    image,
    imageAlt: item.alt || item.title,
    primary: { label: "Retour", ctaKey: type === "activities" ? "activities" : type },
    secondary: { label: "Rejoindre", ctaKey: "join" },
    seo: { title: `${item.title} - Manssuétude`, description: item.description || item.caption || "", image, keywords: item.tags || [] },
  };
  updateSeo(page);
  return `
    ${hero(page)}
    <section class="content-section detail-layout">
      <article class="article-body">
        ${tagList(item.tags)}
        ${contentBlocks(item.contentBlocks)}
        ${!item.contentBlocks?.length ? `<p>${escapeHtml(item.content || item.description || item.caption || "")}</p>` : ""}
      </article>
      <aside class="detail-meta">
        <h2>Informations</h2>
        ${detailMeta(item)}
        ${item.fileUrl || item.url ? `<a class="button primary" href="${item.fileUrl || item.url}" download>Télécharger</a>` : ""}
      </aside>
    </section>
    ${relatedSection(item)}
  `;
}

function detailMeta(item) {
  const rows = [
    ["Type", item.type || item.format || item.category],
    ["Statut", item.progressStatus || item.status],
    ["Priorité", item.priority],
    ["Commission", item.commission],
    ["Avancement", item.progress],
    ["Auteur", item.author],
    ["Date", item.date || item.uploadedAt],
    ["Fichier", item.filename],
    ["Visibilité", item.visibility],
  ].filter(([, value]) => value);
  const lists = [
    ["Objectifs", item.objectives],
    ["Livrables", item.deliverables],
    ["Prochaines étapes", item.nextSteps],
  ].filter(([, value]) => value?.length);
  return rows.map(([label, value]) => `<p><strong>${label}</strong><span>${escapeHtml(value)}</span></p>`).join("")
    + lists.map(([label, values]) => `<p><strong>${label}</strong><span>${values.map(escapeHtml).join(" · ")}</span></p>`).join("");
}

function finalCta() {
  return `<section class="final-cta">
    <div>
      <h2>${escapeHtml(CMS.homepageConfig.ctaTitle)}</h2>
      <p>${escapeHtml(CMS.homepageConfig.ctaText)}</p>
    </div>
    <div class="actions">
      <a class="button primary" href="${ctaUrl(CMS.homepageConfig.finalPrimaryCta)}">Rejoindre Manssuétude</a>
      <a class="button secondary" href="${ctaUrl(CMS.homepageConfig.finalSecondaryCta)}">Nous soutenir</a>
    </div>
  </section>`;
}

function renderFooter() {
  const config = CMS.footerConfig;
  footer.innerHTML = `
    <div class="footer-brand">
      <span class="brand-mark">${escapeHtml(CMS.meta.brandMark)}</span>
      <span class="brand-name">${escapeHtml(CMS.meta.name)}</span>
      <p>${escapeHtml(config.description)}</p>
      <div class="socials" aria-label="Réseaux sociaux">${config.socialLinks.map((link) => `<a href="${link.url}" aria-label="${escapeHtml(link.label)}">${escapeHtml(link.short)}</a>`).join("")}</div>
    </div>
    ${config.columns.map((column) => `<div class="footer-links"><h2>${escapeHtml(column.title)}</h2>${column.links.map((link) => `<a href="${link.url}">${escapeHtml(link.label)}</a>`).join("")}</div>`).join("")}
    ${config.newsletterEnabled ? `<form class="newsletter"><h2>Restons en contact</h2><label><span>Email</span><input type="email" placeholder="Votre email" /></label><button type="submit" aria-label="Envoyer">→</button></form>` : ""}
    <p class="copyright">© 2024 Manssuétude. Tous droits réservés. ${config.legalLinks.map((link) => `<a href="${link.url}">${escapeHtml(link.label)}</a>`).join(" · ")}</p>
  `;
}

function renderPublic() {
  const route = parseRoute();
  if (route.base === "ressources") {
    const page = {
      navLabel: "Ressources",
      eyebrow: "Médiathèque",
      title: "Toutes les ressources Manssuétude.",
      accent: "ressources",
      body: "Retrouvez les fichiers, documents, supports et references reutilisables dans les pages du site.",
      image: "assets/photos/hero-productions.png",
      imageAlt: "Ressources Manssuétude",
      primary: { label: "Voir les productions", ctaKey: "productions" },
      secondary: { label: "Rejoindre", ctaKey: "join" },
      sections: [],
      seo: { title: "Ressources - Manssuétude", description: "Médiathèque Manssuétude.", image: "assets/photos/hero-productions.png", keywords: ["ressources"] },
    };
    updateSeo(page);
    paintNav("productions");
    app.innerHTML = `${globalSearch()}${hero(page)}<section class="content-section"><div class="section-heading"><h2>Médiathèque</h2></div>${resourceCards()}</section>${finalCta()}`;
    renderFooter();
    bindSearch();
    bindCtaActions();
    return;
  }
  const page = CMS.pages[route.base] || CMS.pages.accueil;
  updateSeo(page);
  paintNav(page === CMS.pages.accueil ? "accueil" : route.base);
  app.innerHTML = `${globalSearch()}${hero(page)}${(page.sections || []).map((section) => sectionBlock(section, page)).join("")}${route.base === "ressources" ? resourceCards() : ""}${finalCta()}`;
  renderFooter();
  bindSearch();
  bindFilters();
  bindCtaActions();
}

function renderDetail() {
  const route = parseRoute();
  const map = {
    themes: ["themes", "themes"],
    productions: ["productions", "productions"],
    activites: ["activities", "activities"],
    projets: ["projects", "projects"],
    ressources: ["resources", "resources"],
  };
  const [collectionName, active] = map[route.base] || [];
  if (!collectionName) return false;
  const item = bySlug(collectionName, route.slug);
  paintNav(route.base);
  app.innerHTML = `${globalSearch()}${detailPage(active, item)}${finalCta()}`;
  renderFooter();
  bindSearch();
  bindCtaActions();
  return true;
}

function notFound() {
  return `<section class="empty-state"><h1>Contenu introuvable</h1><p>Le contenu demande n'existe pas ou n'est pas encore publie.</p><a class="button primary" href="#accueil">Retour a l'accueil</a></section>`;
}

function bindDemoForms(root = document) {
  root.querySelectorAll("[data-demo-form]").forEach((form) => {
    if (form.dataset.bound === "true") return;
    form.dataset.bound = "true";
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      formRepository.create(
        form.dataset.demoForm,
        Object.fromEntries([...data.entries()].map(([key, value]) => [key, value?.name || value]))
      );
      form.insertAdjacentHTML("beforeend", `<p class="form-note" role="status">Votre réponse est enregistrée localement. La notification email sera ajoutée avec le backend.</p>`);
      form.reset();
    });
  });
}

function render() {
  applySiteIdentity();
  const route = parseRoute();
  if (route.base === "admin") {
    renderAdmin(route.slug || "dashboard");
  } else if (route.slug && renderDetail()) {
    // Detail page rendered.
  } else {
    renderPublic();
  }
  nav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "instant" });
}

function adminNav(active) {
  const modules = [
    ["dashboard", "Dashboard"],
    ["pages", "Pages"],
    ["homepage", "Homepage"],
    ["navigation", "Navigation"],
    ["themes", "Thèmes"],
    ["activities", "Activités"],
    ["productions", "Productions"],
    ["projects", "Projets"],
    ["resources", "Médiathèque"],
    ["forms", "Formulaires reçus"],
    ["identity", "Identité du site"],
    ["footer", "Footer"],
    ["seo", "SEO"],
    ["settings", "Paramètres"],
    ["backup", "Sauvegarde"],
  ];
  return `<aside class="admin-nav">${modules.map(([id, label]) => `<a class="${id === active ? "active" : ""}" href="#admin/${id}">${label}</a>`).join("")}<button type="button" data-admin-logout>Déconnexion</button></aside>`;
}

function renderAdmin(module) {
  paintNav("admin");
  document.title = "Admin - Manssuétude";
  footer.innerHTML = "";
  if (!authRepository.isAuthenticated()) {
    app.innerHTML = adminLogin();
    bindAdminLogin();
    return;
  }
  app.innerHTML = `<section class="admin-shell">${adminNav(module)}<div class="admin-main">${adminModule(module)}</div></section>`;
  bindAdmin();
}

function adminLogin() {
  return `<section class="admin-login">
    <form class="admin-card wide" data-admin-login>
      <p class="eyebrow">Accès administrateur</p>
      <h1>Centre de commande Manssuétude</h1>
      <p>Mot de passe temporaire V1 : <strong>manssuetude-admin</strong>. Il sera remplacé par une authentification backend avec rôles.</p>
      <label>Mot de passe<input name="password" type="password" autocomplete="current-password" required /></label>
      <button class="button primary" type="submit">Entrer dans l'admin</button>
    </form>
  </section>`;
}

function bindAdminLogin() {
  document.querySelector("[data-admin-login]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (authRepository.login(new FormData(event.currentTarget).get("password"))) render();
    else event.currentTarget.insertAdjacentHTML("beforeend", `<p class="form-note">Mot de passe incorrect.</p>`);
  });
}

function adminModule(module) {
  const map = {
    dashboard: adminDashboard,
    pages: () => adminPages(),
    themes: () => adminCollection("themes"),
    activities: () => adminCollection("activities"),
    productions: () => adminCollection("productions"),
    projects: () => adminCollection("projects"),
    resources: () => adminCollection("resources"),
    forms: adminForms,
    navigation: adminNavigation,
    homepage: adminHomepage,
    identity: adminIdentity,
    footer: adminFooter,
    seo: adminSeo,
    settings: adminSettings,
    backup: adminBackup,
  };
  return (map[module] || adminDashboard)();
}

function adminDashboard() {
  const counts = [
    ["Thèmes", collection("themes").length],
    ["Productions", collection("productions").length],
    ["Projets", collection("projects").length],
    ["Activités", collection("activities").length],
    ["Ressources", collection("resources").length],
  ];
  const featured = searchIndex().filter((item) => item.featured).slice(0, 8);
  const drafts = searchIndex().filter((item) => item.status === "draft").slice(0, 8);
  const latestFiles = collection("resources").slice(0, 5);
  const latestForms = collection("formSubmissions").slice(0, 5);
  const quality = siteQualityIssues();
  return `<div class="admin-header"><p class="eyebrow">Back-office local</p><h1>Dashboard éditorial</h1><p>Cette V1 sauvegarde les modifications dans le navigateur. Elle prépare la future connexion a un vrai CMS.</p></div>
    <div class="admin-stats">${counts.map(([label, value]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join("")}</div>
    <div class="two-col">
      <section class="panel"><h2>Contenus mis en avant</h2>${featured.map((item) => `<a class="list-row" href="${item.url}"><span>${item.kind}</span>${escapeHtml(item.title)}<b>→</b></a>`).join("") || "<p>Aucun contenu.</p>"}</section>
      <section class="panel"><h2>Brouillons</h2>${drafts.map((item) => `<a class="list-row" href="${item.url}"><span>${item.kind}</span>${escapeHtml(item.title)}<b>→</b></a>`).join("") || "<p>Aucun brouillon.</p>"}</section>
    </div>
    <div class="two-col">
      <section class="panel"><h2>Derniers fichiers ajoutés</h2>${latestFiles.map((item) => `<a class="list-row" href="${itemRoute("resources", item)}"><span>${escapeHtml(item.type)}</span>${escapeHtml(item.title)}<b>${escapeHtml(item.size || "")}</b></a>`).join("") || "<p>Aucun fichier.</p>"}</section>
      <section class="panel"><h2>Derniers formulaires reçus</h2>${latestForms.map((item) => `<a class="list-row" href="#admin/forms"><span>${escapeHtml(item.formType)}</span>${escapeHtml(item.data?.Email || item.data?.email || "Réponse reçue")}<b>${escapeHtml(item.status)}</b></a>`).join("") || "<p>Aucune réponse.</p>"}</section>
    </div>
    <section class="panel quality-panel"><h2>Qualité du site</h2>${quality.map((issue) => `<p><strong>${escapeHtml(issue.label)}</strong><span>${escapeHtml(issue.detail)}</span></p>`).join("")}</section>`;
}

function siteQualityIssues() {
  const pages = Object.values(CMS.pages);
  const items = searchIndex();
  const submissions = collection("formSubmissions");
  return [
    { label: "Images sans alt text", detail: `${pages.filter((page) => page.image && !page.imageAlt).length} page(s)` },
    { label: "Contenus sans SEO", detail: `${pages.filter((page) => !page.seo?.title || !page.seo?.description).length} page(s)` },
    { label: "Brouillons", detail: `${items.filter((item) => item.status === "draft").length} contenu(s)` },
    { label: "Archives", detail: `${items.filter((item) => item.status === "archived").length} contenu(s)` },
    { label: "Formulaires non traités", detail: `${submissions.filter((item) => item.status !== "traité" && item.status !== "archivé").length} réponse(s)` },
    { label: "Médias sans alt text", detail: `${collection("resources").filter((item) => item.type === "image" && !item.alt).length} média(s)` },
    { label: "Médias inutilisés", detail: `${collection("resources").filter((item) => !item.relatedContent?.length).length} média(s)` },
  ];
}

function mediaPreview(url, title = "Média") {
  if (!url) return `<div class="media-empty">Aucun média sélectionné</div>`;
  const kind = mediaKind(url);
  if (kind === "image") return `<img src="${url}" alt="${escapeHtml(title)}" onerror="this.src='${CMS.meta.fallbackImage}'" />`;
  return `<div class="media-doc"><strong>${escapeHtml(kind.toUpperCase())}</strong><span>${escapeHtml(url.split("/").pop())}</span></div>`;
}

function mediaField({ label, name, value = "", type = "image", title = "" }) {
  const fieldId = `media-${name}-${Math.random().toString(16).slice(2)}`;
  return `<div class="media-field" data-media-field="${fieldId}" data-media-type="${type}">
    <label>${escapeHtml(label)}<input name="${name}" value="${escapeHtml(value)}" data-media-input /></label>
    <div class="media-preview">${mediaPreview(value, title || label)}</div>
    <div class="media-actions">
      <button type="button" data-media-upload="${fieldId}">Importer depuis mon ordinateur</button>
      <button type="button" data-media-library="${fieldId}">Choisir depuis la médiathèque</button>
      <button type="button" data-media-drive="${fieldId}">Importer depuis Google Drive</button>
      <button type="button" data-media-preview="${fieldId}">Prévisualiser</button>
      <button type="button" data-media-clear="${fieldId}">Supprimer</button>
      <input hidden type="file" data-media-file="${fieldId}" />
    </div>
    <p class="media-help">En V1 locale, l'upload crée une fiche média prête pour le backend. Le fichier devra être stocké côté serveur en production.</p>
  </div>`;
}

function adminPages() {
  return `<div class="admin-header"><h1>Pages statiques</h1><p>Modifiez les titres, accroches et images des pages principales.</p></div>
    <div class="admin-list">${Object.entries(CMS.pages).map(([id, page]) => `
      <form class="admin-card" data-page-form="${id}">
        <h2>${escapeHtml(page.navLabel)}</h2>
        <label>Eyebrow<input name="eyebrow" value="${escapeHtml(page.eyebrow || "")}" /></label>
        <label>Titre<input name="title" value="${escapeHtml(page.title)}" /></label>
        <label>Accroche<textarea name="body">${escapeHtml(page.body)}</textarea></label>
        ${mediaField({ label: "Image hero", name: "image", value: page.image, type: "image", title: page.title })}
        <label>Citation<input name="quote" value="${escapeHtml(page.quote || "")}" /></label>
        <label>Bouton principal<input name="primaryLabel" value="${escapeHtml(page.primary?.label || "")}" /></label>
        <label>Destination bouton principal<input name="primaryCta" value="${escapeHtml(page.primary?.ctaKey || "")}" /></label>
        <label>Bouton secondaire<input name="secondaryLabel" value="${escapeHtml(page.secondary?.label || "")}" /></label>
        <label>Destination bouton secondaire<input name="secondaryCta" value="${escapeHtml(page.secondary?.ctaKey || "")}" /></label>
        <label>Sections visibles / ordre (JSON)<textarea name="sections">${escapeHtml(JSON.stringify(page.sections || [], null, 2))}</textarea></label>
        <label>SEO title<input name="seoTitle" value="${escapeHtml(page.seo?.title || "")}" /></label>
        <label>SEO description<textarea name="seoDescription">${escapeHtml(page.seo?.description || "")}</textarea></label>
        <button class="button primary" type="submit">Enregistrer</button>
      </form>
    `).join("")}</div>`;
}

function adminCollection(name) {
  const titles = { themes: "Thèmes", productions: "Productions", activities: "Activités", projects: "Projets", resources: "Médiathèque" };
  return `<div class="admin-header">
      <h1>${titles[name]}</h1>
      <p>Creation, modification, duplication, publication, mise en avant et archivage.</p>
      <button class="button primary" type="button" data-create="${name}">Créer un contenu</button>
    </div>
    ${name === "resources" ? uploadPanel() : ""}
    <div class="admin-list">${collection(name).map((item) => adminItemForm(name, item)).join("")}</div>`;
}

function uploadPanel() {
  return `<form class="admin-card wide" data-upload-form>
    <h2>Ajouter un média</h2>
    <p>Ajoutez une image, un PDF, un document, une vidéo, un audio, une archive, un lien YouTube/Vimeo ou Google Drive.</p>
    <label>Fichier<input type="file" name="file" /></label>
    <label>Lien externe / Google Drive / YouTube / Vimeo<input name="externalUrl" placeholder="https://..." /></label>
    <label>Titre public<input name="title" placeholder="Titre de la ressource" /></label>
    <label>Description<textarea name="description" placeholder="Description courte"></textarea></label>
    <label>Alt text<input name="alt" placeholder="Texte alternatif si image" /></label>
    <label>Légende<input name="caption" placeholder="Légende publique" /></label>
    <label>Auteur<input name="author" placeholder="Manssuétude" /></label>
    <label>Visibilité<select name="visibility"><option>public</option><option>privé</option><option>brouillon</option></select></label>
    <label>Associer à un contenu<input name="relatedContent" placeholder="id-theme, id-production..." /></label>
    <label>Tags<input name="tags" placeholder="tag 1, tag 2" /></label>
    <button class="button primary" type="submit">Ajouter à la médiathèque</button>
  </form>`;
}

function adminItemForm(name, item) {
  const description = item.description || item.caption || "";
  const image = item.thumbnail || item.heroImage || item.gallery?.[0] || "";
  return `<form class="admin-card" data-item-form="${name}" data-id="${item.id}">
    <div class="admin-card-head">
      <h2>${escapeHtml(item.title)}</h2>
      <span>${escapeHtml(item.status || "draft")}</span>
    </div>
    <label>Titre<input name="title" value="${escapeHtml(item.title)}" /></label>
    <label>Slug<input name="slug" value="${escapeHtml(item.slug || slugify(item.title))}" /></label>
    <label>Description<textarea name="description">${escapeHtml(description)}</textarea></label>
    ${mediaField({ label: name === "resources" ? "Fichier" : "Image", name: "asset", value: image || item.url || "", type: name === "resources" ? "file" : "image", title: item.title })}
    ${name === "resources" ? `
      <label>Type<select name="type">${["image", "video", "pdf", "document", "audio", "archive"].map((type) => `<option value="${type}" ${item.type === type ? "selected" : ""}>${type}</option>`).join("")}</select></label>
      <label>Source<select name="source">${["upload", "google-drive", "external-url", "youtube", "vimeo"].map((source) => `<option value="${source}" ${item.source === source ? "selected" : ""}>${source}</option>`).join("")}</select></label>
      <label>Alt text<input name="alt" value="${escapeHtml(item.alt || "")}" /></label>
      <label>Légende<input name="caption" value="${escapeHtml(item.caption || "")}" /></label>
      <label>Visibilité<select name="visibility">${["public", "private", "draft"].map((visibility) => `<option value="${visibility}" ${item.visibility === visibility || item.visibility === "privé" && visibility === "private" ? "selected" : ""}>${visibility}</option>`).join("")}</select></label>
      <label>Contenus associés<input name="relatedContent" value="${escapeHtml((item.relatedContent || []).join(", "))}" /></label>
    ` : ""}
    <label>Tags<input name="tags" value="${escapeHtml((item.tags || []).join(", "))}" /></label>
    <div class="admin-actions">
      <button type="submit">Enregistrer</button>
      <button type="button" data-toggle-publish="${name}:${item.id}">${item.status === "published" ? "Depublier" : "Publier"}</button>
      <button type="button" data-toggle-feature="${name}:${item.id}">${item.featured ? "Retirer de la une" : "Mettre en avant"}</button>
      <button type="button" data-duplicate="${name}:${item.id}">Dupliquer</button>
      <button type="button" data-archive="${name}:${item.id}">Archiver</button>
      <button type="button" data-delete="${name}:${item.id}">Supprimer</button>
      ${name === "resources" ? `<a class="button secondary" href="${item.url || "#ressources"}" download>Télécharger</a><button type="button" data-copy-link="${escapeHtml(item.url || "")}">Copier le lien</button><a class="button secondary" href="${item.url || "#ressources"}" target="_blank" rel="noreferrer">Prévisualiser</a>` : ""}
    </div>
  </form>`;
}

function adminNavigation() {
  return `<div class="admin-header"><h1>Navigation</h1><p>Les libelles et routes du menu sont administrables.</p></div>
    <div class="admin-list">${CMS.nav.filter((item) => !item.hidden).map((item, index) => `
      <form class="admin-card" data-nav-form="${index}">
        <label>Libelle<input name="label" value="${escapeHtml(item.label)}" /></label>
        <label>Route<input name="route" value="${escapeHtml(item.route)}" /></label>
        <button class="button primary" type="submit">Enregistrer</button>
      </form>
    `).join("")}</div>`;
}

function adminHomepage() {
  const config = CMS.homepageConfig;
  return `<form class="admin-card wide" data-homepage-form>
    <div class="admin-header"><h1>Homepage</h1><p>Pilotez le sujet du moment, les contenus mis en avant, les chiffres et le CTA final.</p></div>
    <label>Theme mis en avant<select name="featuredTheme">${collection("themes").map((item) => `<option value="${item.id}" ${config.featuredTheme === item.id ? "selected" : ""}>${escapeHtml(item.title)}</option>`).join("")}</select></label>
    <label>Productions mises en avant<input name="featuredProductions" value="${escapeHtml(config.featuredProductions.join(", "))}" /></label>
    <label>Elements en ce moment<input name="currentItems" value="${escapeHtml(config.currentItems.join(", "))}" /></label>
    <label>Afficher les chiffres clés<select name="showStats"><option value="false" ${!config.showStats ? "selected" : ""}>Non</option><option value="true" ${config.showStats ? "selected" : ""}>Oui</option></select></label>
    <label>Titre CTA<input name="ctaTitle" value="${escapeHtml(config.ctaTitle)}" /></label>
    <label>Texte CTA<textarea name="ctaText">${escapeHtml(config.ctaText)}</textarea></label>
    <button class="button primary" type="submit">Enregistrer la homepage</button>
  </form>`;
}

function adminForms() {
  const submissions = collection("formSubmissions");
  return `<div class="admin-header">
    <h1>Formulaires</h1>
    <p>Consultez les réponses reçues, changez leur statut et exportez les données en CSV.</p>
    <button class="button primary" type="button" data-export-forms>Exporter CSV</button>
  </div>
  <div class="admin-list">${submissions.map((item) => `
    <form class="admin-card" data-submission-form="${item.id}">
      <div class="admin-card-head"><h2>${escapeHtml(item.formType)}</h2><span>${escapeHtml(item.status)}</span></div>
      <p class="meta">${escapeHtml(new Date(item.receivedAt).toLocaleString("fr-FR"))}</p>
      ${Object.entries(item.data || {}).map(([key, value]) => `<p><strong>${escapeHtml(key)}</strong><br>${escapeHtml(value)}</p>`).join("")}
      <label>Statut<select name="status"><option ${item.status === "reçu" ? "selected" : ""}>reçu</option><option ${item.status === "en cours" ? "selected" : ""}>en cours</option><option ${item.status === "traité" ? "selected" : ""}>traité</option><option ${item.status === "archivé" ? "selected" : ""}>archivé</option></select></label>
      <div class="admin-actions">
        <button type="submit">Mettre à jour</button>
        <button type="button" data-delete-submission="${item.id}">Supprimer</button>
        <a class="button secondary" href="mailto:${escapeHtml(item.data?.Email || "")}">Répondre par email</a>
      </div>
    </form>
  `).join("") || `<section class="panel"><h2>Aucune réponse pour l'instant</h2><p>Les formulaires publics enregistrent les réponses localement en attendant le backend.</p></section>`}</div>`;
}

function adminSettings() {
  return `<form class="admin-card wide" data-advanced-settings-form>
    <div class="admin-header"><h1>Paramètres</h1><p>Réglages techniques de la V1 locale et préparation des repositories backend.</p></div>
    <label>Mot de passe temporaire admin<input name="adminPassword" value="${escapeHtml(CMS.settings?.adminPassword || "manssuetude-admin")}" /></label>
    <label>Rôles préparés<input name="roles" value="${escapeHtml((CMS.settings?.roles || []).join(", "))}" /></label>
    <label>Masquer les chiffres non validés<select name="hideUnvalidatedStats"><option value="true" ${CMS.settings.hideUnvalidatedStats ? "selected" : ""}>Oui</option><option value="false" ${!CMS.settings.hideUnvalidatedStats ? "selected" : ""}>Non</option></select></label>
    <p class="media-help">Repositories prévus : contentRepository, mediaRepository, formRepository, authRepository. Aujourd'hui ils utilisent le navigateur ; demain ils peuvent pointer vers une API.</p>
    <button class="button primary" type="submit">Enregistrer</button>
  </form>`;
}

function adminIdentity() {
  return `<form class="admin-card wide" data-settings-form>
    <div class="admin-header"><h1>Identité du site</h1><p>Logo, favicon, slogan, couleurs et image fallback.</p></div>
    <label>Nom du site<input name="name" value="${escapeHtml(CMS.meta.name)}" /></label>
    ${mediaField({ label: "Logo", name: "logo", value: CMS.meta.logo || "", type: "image", title: CMS.meta.name })}
    ${mediaField({ label: "Favicon", name: "favicon", value: CMS.meta.favicon || "", type: "image", title: "Favicon" })}
    ${mediaField({ label: "Image fallback", name: "fallbackImage", value: CMS.meta.fallbackImage || "", type: "image", title: "Image fallback" })}
    <label>Slogan<textarea name="tagline">${escapeHtml(CMS.meta.tagline || "")}</textarea></label>
    <label>Phrase PERCA<input name="percaPhrase" value="${escapeHtml(CMS.meta.percaPhrase || "")}" /></label>
    <label>Couleur principale<input name="primary" value="${escapeHtml(CMS.meta.colors?.primary || "#ff4d12")}" /></label>
    <label>Couleur secondaire<input name="secondary" value="${escapeHtml(CMS.meta.colors?.secondary || "#0d0d0f")}" /></label>
    <button class="button primary" type="submit">Enregistrer l'identité</button>
  </form>`;
}

function adminFooter() {
  const footerConfig = CMS.footerConfig;
  return `<form class="admin-card wide" data-footer-form>
    <div class="admin-header"><h1>Footer</h1><p>Texte, colonnes, newsletter, réseaux sociaux et mentions légales.</p></div>
    <label>Description footer<textarea name="description">${escapeHtml(footerConfig.description)}</textarea></label>
    <label>Newsletter active<select name="newsletterEnabled"><option value="true" ${footerConfig.newsletterEnabled ? "selected" : ""}>Oui</option><option value="false" ${!footerConfig.newsletterEnabled ? "selected" : ""}>Non</option></select></label>
    <label>Réseaux sociaux (JSON)<textarea name="socialLinks">${escapeHtml(JSON.stringify(footerConfig.socialLinks, null, 2))}</textarea></label>
    <label>Colonnes (JSON)<textarea name="columns">${escapeHtml(JSON.stringify(footerConfig.columns, null, 2))}</textarea></label>
    <label>Liens légaux (JSON)<textarea name="legalLinks">${escapeHtml(JSON.stringify(footerConfig.legalLinks, null, 2))}</textarea></label>
    <button class="button primary" type="submit">Enregistrer le footer</button>
  </form>`;
}

function adminSeo() {
  return `<div class="admin-header"><h1>SEO</h1><p>Chaque page principale dispose d'un titre, d'une description, d'une image Open Graph et de mots-clés.</p></div>
    <div class="admin-list">${Object.entries(CMS.pages).map(([id, page]) => `
      <form class="admin-card" data-seo-form="${id}">
        <h2>${escapeHtml(page.navLabel)}</h2>
        <label>Meta title<input name="title" value="${escapeHtml(page.seo?.title || "")}" /></label>
        <label>Meta description<textarea name="description">${escapeHtml(page.seo?.description || "")}</textarea></label>
        ${mediaField({ label: "Image OG", name: "image", value: page.seo?.image || page.image || "", type: "image", title: page.navLabel })}
        <label>Mots-clés<input name="keywords" value="${escapeHtml((page.seo?.keywords || []).join(", "))}" /></label>
        <button class="button primary" type="submit">Enregistrer SEO</button>
      </form>
    `).join("")}</div>`;
}

function adminBackup() {
  return `<section class="admin-card wide">
    <div class="admin-header"><h1>Sauvegarde / Export / Import</h1><p>Exportez toute la configuration, importez une sauvegarde ou réinitialisez la V1 locale.</p></div>
    <div class="admin-actions">
      <button type="button" data-export-content>Exporter JSON</button>
      <button type="button" data-import-content>Importer JSON</button>
      <button type="button" data-reset-content>Réinitialiser les données locales</button>
    </div>
    <textarea data-backup-json placeholder="Collez ici une sauvegarde JSON pour l'import"></textarea>
    <p class="media-help">Limite V1 : les fichiers uploadés ne sont pas encore copiés physiquement. Le backend devra gérer stockage, authentification, historique et permissions.</p>
  </section>`;
}

function bindMediaAdmin() {
  document.querySelectorAll("[data-media-upload]").forEach((button) => {
    button.addEventListener("click", () => document.querySelector(`[data-media-file="${button.dataset.mediaUpload}"]`)?.click());
  });
  document.querySelectorAll("[data-media-file]").forEach((input) => {
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return;
      const field = document.querySelector(`[data-media-field="${input.dataset.mediaFile}"]`);
      const target = field?.querySelector("[data-media-input]");
      const url = `assets/files/${file.name}`;
      if (target) target.value = url;
      field.querySelector(".media-preview").innerHTML = mediaPreview(URL.createObjectURL(file), file.name);
      collection("resources").unshift({
        id: `media-${Date.now()}`,
        filename: file.name,
        title: file.name,
        source: "upload",
        type: mediaKind(file.name),
        mimeType: file.type || mediaMime({ filename: file.name }),
        url,
        previewUrl: url,
        thumbnailUrl: mediaKind(file.name) === "image" ? url : "",
        size: `${Math.max(1, Math.round(file.size / 1024))} Ko`,
        uploadedAt: new Date().toISOString().slice(0, 10),
        updatedAt: new Date().toISOString().slice(0, 10),
        tags: [],
        alt: file.name,
        caption: "",
        description: "Média ajouté depuis un champ admin. Stockage réel à connecter au backend.",
        visibility: "draft",
        relatedContent: [],
        status: "draft",
      });
      saveContent();
    });
  });
  document.querySelectorAll("[data-media-library]").forEach((button) => {
    button.addEventListener("click", () => openMediaLibrary(button.dataset.mediaLibrary));
  });
  document.querySelectorAll("[data-media-drive]").forEach((button) => {
    button.addEventListener("click", () => openDriveImport(button.dataset.mediaDrive));
  });
  document.querySelectorAll("[data-media-clear]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = document.querySelector(`[data-media-field="${button.dataset.mediaClear}"]`);
      field.querySelector("[data-media-input]").value = "";
      field.querySelector(".media-preview").innerHTML = mediaPreview("");
    });
  });
  document.querySelectorAll("[data-media-preview]").forEach((button) => {
    button.addEventListener("click", () => {
      const value = document.querySelector(`[data-media-field="${button.dataset.mediaPreview}"] [data-media-input]`)?.value;
      if (value) window.open(value, "_blank", "noreferrer");
    });
  });
}

function openMediaLibrary(fieldId) {
  closeModal();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" data-modal-backdrop>
      <section class="modal-panel media-picker" role="dialog" aria-modal="true" aria-labelledby="media-picker-title">
        <button class="modal-close" type="button" data-close-modal aria-label="Fermer la médiathèque">×</button>
        <p class="eyebrow">Médiathèque</p>
        <h2 id="media-picker-title">Choisir un média</h2>
        <div class="media-library-grid">${collection("resources").map((item) => `
          <button type="button" data-pick-media="${escapeHtml(item.url)}">
            <span class="media-preview">${mediaPreview(item.thumbnailUrl || item.previewUrl || item.url, item.title)}</span>
            <strong>${escapeHtml(item.title)}</strong>
            <small>${escapeHtml(item.type)} · ${escapeHtml(item.source || "upload")}</small>
          </button>
        `).join("") || "<p>Aucun média disponible.</p>"}</div>
      </section>
    </div>
  `);
  document.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  document.querySelectorAll("[data-pick-media]").forEach((button) => {
    button.addEventListener("click", () => {
      const field = document.querySelector(`[data-media-field="${fieldId}"]`);
      field.querySelector("[data-media-input]").value = button.dataset.pickMedia;
      field.querySelector(".media-preview").innerHTML = mediaPreview(button.dataset.pickMedia);
      closeModal();
    });
  });
}

function openDriveImport(fieldId) {
  closeModal();
  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal-backdrop" data-modal-backdrop>
      <section class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="drive-title">
        <button class="modal-close" type="button" data-close-modal aria-label="Fermer Google Drive">×</button>
        <p class="eyebrow">Google Drive</p>
        <h2 id="drive-title">Importer depuis Google Drive</h2>
        <form data-drive-form>
          <label>Nom public<input name="title" required /></label>
          <label>URL ou identifiant Drive<input name="url" required placeholder="https://drive.google.com/..." /></label>
          <label>Type<select name="type"><option>image</option><option>pdf</option><option>document</option><option>video</option><option>audio</option><option>archive</option></select></label>
          <p class="media-help">Si le fichier Drive n'est pas public, vérifiez les autorisations de partage avant publication.</p>
          <button class="button primary" type="submit">Ajouter et utiliser</button>
        </form>
      </section>
    </div>
  `);
  document.querySelector("[data-close-modal]").addEventListener("click", closeModal);
  document.querySelector("[data-drive-form]").addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const url = data.get("url");
    const media = {
      id: `drive-${Date.now()}`,
      filename: data.get("title"),
      title: data.get("title"),
      source: "google-drive",
      driveFileId: String(url).match(/[-\\w]{20,}/)?.[0] || "",
      type: data.get("type"),
      mimeType: "application/octet-stream",
      url,
      previewUrl: url,
      thumbnailUrl: "",
      size: "Drive",
      uploadedAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
      tags: ["google-drive"],
      alt: data.get("title"),
      caption: "",
      description: "Fichier importé depuis Google Drive. Autorisations à vérifier.",
      visibility: "draft",
      permissions: "restricted",
      relatedContent: [],
      status: "draft",
    };
    collection("resources").unshift(media);
    const field = document.querySelector(`[data-media-field="${fieldId}"]`);
    field.querySelector("[data-media-input]").value = url;
    field.querySelector(".media-preview").innerHTML = mediaPreview(url, media.title);
    saveContent();
    closeModal();
  });
}

function bindAdmin() {
  document.querySelectorAll("[data-page-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const id = form.dataset.pageForm;
      CMS.pages[id].eyebrow = data.get("eyebrow");
      CMS.pages[id].title = data.get("title");
      CMS.pages[id].body = data.get("body");
      CMS.pages[id].image = data.get("image");
      CMS.pages[id].quote = data.get("quote");
      CMS.pages[id].primary = { label: data.get("primaryLabel"), ctaKey: data.get("primaryCta") };
      CMS.pages[id].secondary = { label: data.get("secondaryLabel"), ctaKey: data.get("secondaryCta") };
      try {
        CMS.pages[id].sections = JSON.parse(data.get("sections") || "[]");
      } catch {
        form.insertAdjacentHTML("beforeend", `<p class="form-note">Le JSON des sections n'est pas valide.</p>`);
        return;
      }
      CMS.pages[id].seo ||= {};
      CMS.pages[id].seo.title = data.get("seoTitle");
      CMS.pages[id].seo.description = data.get("seoDescription");
      saveContent();
      render();
    });
  });

  document.querySelectorAll("[data-item-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const item = byId(form.dataset.itemForm, form.dataset.id);
      item.title = data.get("title");
      item.slug = data.get("slug") || slugify(data.get("title"));
      if ("description" in item) item.description = data.get("description");
      else item.caption = data.get("description");
      if ("thumbnail" in item) item.thumbnail = data.get("asset");
      else if ("heroImage" in item) item.heroImage = data.get("asset");
      else if ("url" in item) item.url = data.get("asset");
      if (form.dataset.itemForm === "resources") {
        item.url = data.get("asset");
        item.previewUrl = data.get("asset");
        item.type = data.get("type");
        item.source = data.get("source");
        item.alt = data.get("alt");
        item.caption = data.get("caption");
        item.visibility = data.get("visibility");
        item.relatedContent = data.get("relatedContent").split(",").map((entry) => entry.trim()).filter(Boolean);
        item.updatedAt = new Date().toISOString().slice(0, 10);
      }
      item.tags = data.get("tags").split(",").map((tag) => tag.trim()).filter(Boolean);
      saveContent();
      render();
    });
  });

  document.querySelectorAll("[data-create]").forEach((button) => {
    button.addEventListener("click", () => {
      const name = button.dataset.create;
      const id = `${name.slice(0, -1)}-${Date.now()}`;
      const base = {
        id,
        slug: id,
        title: "Nouveau contenu",
        description: "Description a completer.",
        status: "draft",
        featured: false,
        tags: [],
      };
      if (name === "resources") Object.assign(base, { filename: "nouveau-fichier.pdf", type: "pdf", url: "assets/files/exemple-ressource.txt", uploadedAt: new Date().toISOString().slice(0, 10), relatedContent: [] });
      if (name === "projects") Object.assign(base, { category: "Interne", progressStatus: "idée", priority: "expérimental", objectives: [], documents: [], relatedThemes: [], relatedProductions: [], relatedActivities: [] });
      if (name === "activities") Object.assign(base, { format: "atelier", progressStatus: "préparation", gallery: [], relatedThemes: [], relatedProductions: [], documents: [] });
      if (name === "productions") Object.assign(base, { type: "article", content: "", contentBlocks: [], date: new Date().toISOString().slice(0, 10), author: "Manssuétude", relatedThemes: [], relatedProjects: [], relatedActivities: [] });
      if (name === "themes") Object.assign(base, { shortTitle: "Nouveau theme", longDescription: "", heroImage: "assets/photos/hero-themes.png", thumbnail: "assets/photos/hero-themes.png", relatedProductions: [], relatedProjects: [], relatedActivities: [], resources: [] });
      collection(name).unshift(base);
      saveContent();
      render();
    });
  });

  document.querySelectorAll("[data-toggle-publish], [data-toggle-feature], [data-duplicate], [data-archive], [data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      const attr = [...button.attributes].find((attr) => attr.name.startsWith("data-") && attr.value.includes(":"));
      const [name, id] = attr.value.split(":");
      const list = collection(name);
      const item = byId(name, id);
      if (!item) return;
      if (attr.name === "data-toggle-publish") item.status = item.status === "published" ? "draft" : "published";
      if (attr.name === "data-toggle-feature") item.featured = !item.featured;
      if (attr.name === "data-archive") item.status = "archived";
      if (attr.name === "data-duplicate") list.unshift({ ...structuredClone(item), id: `${item.id}-copie-${Date.now()}`, slug: `${item.slug}-copie`, title: `${item.title} copie`, status: "draft", featured: false });
      if (attr.name === "data-delete") list.splice(list.indexOf(item), 1);
      saveContent();
      render();
    });
  });

  document.querySelector("[data-homepage-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    CMS.homepageConfig.featuredTheme = data.get("featuredTheme");
    CMS.homepageConfig.featuredProductions = data.get("featuredProductions").split(",").map((item) => item.trim()).filter(Boolean);
    CMS.homepageConfig.currentItems = data.get("currentItems").split(",").map((item) => item.trim()).filter(Boolean);
    CMS.homepageConfig.showStats = data.get("showStats") === "true";
    CMS.homepageConfig.ctaTitle = data.get("ctaTitle");
    CMS.homepageConfig.ctaText = data.get("ctaText");
    saveContent();
    render();
  });

  document.querySelector("[data-settings-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    CMS.meta.name = data.get("name");
    CMS.meta.logo = data.get("logo");
    CMS.meta.favicon = data.get("favicon");
    CMS.meta.fallbackImage = data.get("fallbackImage");
    CMS.meta.tagline = data.get("tagline");
    CMS.meta.percaPhrase = data.get("percaPhrase");
    CMS.meta.colors = {
      primary: data.get("primary"),
      secondary: data.get("secondary"),
    };
    saveContent();
    render();
  });

  document.querySelector("[data-footer-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    CMS.footerConfig.description = data.get("description");
    CMS.footerConfig.newsletterEnabled = data.get("newsletterEnabled") === "true";
    try {
      CMS.footerConfig.socialLinks = JSON.parse(data.get("socialLinks"));
      CMS.footerConfig.columns = JSON.parse(data.get("columns"));
      CMS.footerConfig.legalLinks = JSON.parse(data.get("legalLinks"));
    } catch {
      event.currentTarget.insertAdjacentHTML("beforeend", `<p class="form-note">Le JSON du footer n'est pas valide.</p>`);
      return;
    }
    saveContent();
    render();
  });

  document.querySelector("[data-advanced-settings-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    CMS.settings.adminPassword = data.get("adminPassword");
    CMS.settings.roles = data.get("roles").split(",").map((role) => role.trim()).filter(Boolean);
    CMS.settings.hideUnvalidatedStats = data.get("hideUnvalidatedStats") === "true";
    saveContent();
    render();
  });

  document.querySelectorAll("[data-seo-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const page = CMS.pages[form.dataset.seoForm];
      page.seo ||= {};
      page.seo.title = data.get("title");
      page.seo.description = data.get("description");
      page.seo.image = data.get("image");
      page.seo.keywords = data.get("keywords").split(",").map((item) => item.trim()).filter(Boolean);
      saveContent();
      render();
    });
  });

  document.querySelector("[data-upload-form]")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    const externalUrl = data.get("externalUrl");
    if ((!file || !file.name) && !externalUrl) return;
    const id = `resource-${Date.now()}`;
    const filename = file?.name || externalUrl.split("/").pop() || "media-externe";
    const extension = filename.split(".").pop().toLowerCase();
    collection("resources").unshift({
      id,
      filename,
      title: data.get("title") || filename,
      source: externalUrl ? (externalUrl.includes("drive.google") ? "google-drive" : externalUrl.includes("youtube") ? "youtube" : externalUrl.includes("vimeo") ? "vimeo" : "external-url") : "upload",
      type: mediaKind(filename),
      mimeType: file?.type || mediaMime({ filename }),
      url: externalUrl || `assets/files/${filename}`,
      previewUrl: externalUrl || `assets/files/${filename}`,
      thumbnailUrl: mediaKind(filename) === "image" ? (externalUrl || `assets/files/${filename}`) : "",
      size: file?.size ? `${Math.max(1, Math.round(file.size / 1024))} Ko` : "Taille à renseigner",
      uploadedAt: new Date().toISOString().slice(0, 10),
      tags: data.get("tags").split(",").map((tag) => tag.trim()).filter(Boolean),
      alt: data.get("alt") || data.get("title") || file.name,
      caption: data.get("caption") || data.get("description") || "Fichier ajouté depuis l'admin local.",
      description: data.get("description") || "",
      author: data.get("author") || CMS.meta.name,
      relatedContent: data.get("relatedContent").split(",").map((entry) => entry.trim()).filter(Boolean),
      visibility: data.get("visibility"),
      status: data.get("visibility") === "public" ? "published" : "draft",
      featured: false,
    });
    saveContent();
    render();
  });

  document.querySelectorAll("[data-submission-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const item = collection("formSubmissions").find((entry) => entry.id === form.dataset.submissionForm);
      if (!item) return;
      item.status = new FormData(form).get("status");
      saveContent();
      render();
    });
  });

  document.querySelectorAll("[data-delete-submission]").forEach((button) => {
    button.addEventListener("click", () => {
      const list = collection("formSubmissions");
      const item = list.find((entry) => entry.id === button.dataset.deleteSubmission);
      if (item) list.splice(list.indexOf(item), 1);
      saveContent();
      render();
    });
  });

  document.querySelector("[data-export-forms]")?.addEventListener("click", () => {
    const rows = collection("formSubmissions");
    const headers = ["id", "formType", "status", "receivedAt", "data"];
    const csv = [headers.join(","), ...rows.map((item) => headers.map((key) => `"${String(key === "data" ? JSON.stringify(item.data) : item[key] || "").replaceAll('"', '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "formulaires-manssuetude.csv";
    link.click();
    URL.revokeObjectURL(url);
  });

  document.querySelectorAll("[data-copy-link]").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(button.dataset.copyLink);
        button.textContent = "Lien copié";
      } catch {
        button.textContent = "Copie indisponible";
      }
    });
  });

  document.querySelector("[data-reset-content]")?.addEventListener("click", () => {
    contentRepository.reset();
    CMS = normalizeCMS(structuredClone(SITE_CONTENT));
    render();
  });

  document.querySelector("[data-export-content]")?.addEventListener("click", () => {
    const blob = new Blob([contentRepository.export()], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "manssuetude-content.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  document.querySelector("[data-import-content]")?.addEventListener("click", () => {
    const textarea = document.querySelector("[data-backup-json]");
    if (!textarea?.value.trim()) return;
    try {
      contentRepository.import(textarea.value);
      render();
    } catch {
      textarea.insertAdjacentHTML("afterend", `<p class="form-note">Import impossible : JSON invalide.</p>`);
    }
  });

  document.querySelector("[data-admin-logout]")?.addEventListener("click", () => {
    authRepository.logout();
    render();
  });

  bindMediaAdmin();
}

menuToggle.addEventListener("click", () => {
  const expanded = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!expanded));
  nav.classList.toggle("open");
});

window.addEventListener("hashchange", render);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeModal();
});
render();
