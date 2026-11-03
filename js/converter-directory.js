const catalog = window.convoConverterCatalog;
const searchInput = document.getElementById("converterSearch");
const categoryNav = document.getElementById("converterCategoryNav");
const categoriesRoot = document.getElementById("converterCategories");
const resultCount = document.getElementById("converterResultCount");
const emptyState = document.getElementById("converterEmptyState");
const categoryNames = {
  ai: "AI tools",
  data: "Data & spreadsheets",
  documents: "Documents",
  images: "Images",
  media: "Audio, video & subtitles",
  ebooks: "E-books",
};
const categoryFilterNames = {
  ai: "AI tools",
  data: "Data",
  documents: "Documents",
  images: "Images",
  media: "Audio & video",
  ebooks: "E-books",
};
const categoryIcons = {
  ai: "fa-wand-magic-sparkles",
  data: "fa-table",
  documents: "fa-file-lines",
  images: "fa-image",
  media: "fa-photo-film",
  ebooks: "fa-book-open",
};
let activeCategory = "all";

if (!Array.isArray(catalog) || catalog.length !== 225) {
  throw new Error("The ConvoTools converter directory could not be loaded.");
}

function createCategoryButton(category, label, count) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "directory-category-button";
  button.dataset.category = category;
  button.setAttribute("aria-pressed", String(activeCategory === category));
  const icon = document.createElement("i");
  icon.className =
    category === "all" ? "fa-solid fa-layer-group" : `fa-solid ${categoryIcons[category]}`;
  icon.setAttribute("aria-hidden", "true");
  const name = document.createElement("span");
  name.textContent = label;
  const badge = document.createElement("span");
  badge.className = "directory-category-count";
  badge.textContent = count;
  button.append(icon, name, badge);
  button.addEventListener("click", () => {
    activeCategory = category;
    renderDirectory();
  });
  return button;
}

function createConverterCard(converter) {
  const card = document.createElement("a");
  card.className = "converter-directory-card";
  card.style.setProperty("--card-order", String(catalog.indexOf(converter) % 12));
  card.href = converter.localPage ||
    `./converter.html?tool=${encodeURIComponent(converter.id)}`;

  const top = document.createElement("span");
  top.className = "converter-card-topline";
  const icon = document.createElement("span");
  icon.className = "converter-card-icon";
  const categoryIcon = document.createElement("i");
  categoryIcon.className = `fa-solid ${categoryIcons[converter.category]}`;
  categoryIcon.setAttribute("aria-hidden", "true");
  icon.append(categoryIcon);
  const formats = document.createElement("span");
  formats.className = "converter-card-formats";
  formats.textContent =
    converter.source && converter.target
      ? `${converter.source} → ${converter.target}`
      : "UTILITY";
  top.append(icon, formats);

  const title = document.createElement("h3");
  title.textContent = converter.name;
  const detail = document.createElement("span");
  detail.className = "converter-directory-card-action";
  detail.textContent = "Open tool";
  const arrow = document.createElement("i");
  arrow.className = "converter-card-arrow fa-solid fa-arrow-up-right-from-square";
  arrow.setAttribute("aria-hidden", "true");
  detail.append(arrow);
  card.append(top, title, detail);
  return card;
}

function renderDirectory() {
  const query = searchInput.value.trim().toLowerCase();
  const matches = catalog.filter((converter) => {
    const categoryMatches =
      activeCategory === "all" || converter.category === activeCategory;
    const queryMatches =
      `${converter.name} ${converter.source} ${converter.target} ${converter.id}`
        .toLowerCase()
        .includes(query);
    return categoryMatches && queryMatches;
  });
  const visibleCategories = [...new Set(matches.map((item) => item.category))];

  categoryNav.replaceChildren(
    createCategoryButton("all", "All converters", matches.length),
    ...Object.keys(categoryNames)
      .map((category) =>
        createCategoryButton(
          category,
          categoryFilterNames[category],
          matches.filter((item) => item.category === category).length,
        ),
      ),
  );

  const sections = visibleCategories.map((category) => {
    const section = document.createElement("section");
    section.className = "converter-category-section";
    section.id = `category-${category}`;
    const heading = document.createElement("div");
    heading.className = "converter-category-heading";
    const title = document.createElement("h2");
    title.textContent = categoryNames[category];
    const categoryIcon = document.createElement("i");
    categoryIcon.className = `fa-solid ${categoryIcons[category]}`;
    categoryIcon.setAttribute("aria-hidden", "true");
    title.prepend(categoryIcon);
    const count = document.createElement("span");
    count.textContent = `${matches.filter((item) => item.category === category).length} converters`;
    heading.append(title, count);
    const grid = document.createElement("div");
    grid.className = "converter-directory-grid";
    grid.append(
      ...matches
        .filter((item) => item.category === category)
        .map(createConverterCard),
    );
    section.append(heading, grid);
    return section;
  });

  categoriesRoot.replaceChildren(...sections);
  resultCount.textContent = `${matches.length} ${
    matches.length === 1 ? "converter" : "converters"
  } shown`;
  emptyState.hidden = matches.length > 0;
}

searchInput.addEventListener("input", renderDirectory);
renderDirectory();
