const toolSearch = document.getElementById("toolSearch");
const toolResultsCount = document.getElementById("toolResultsCount");
const toolEmptyState = document.getElementById("toolEmptyState");
const toolFilters = [...document.querySelectorAll(".tool-filter")];
const toolCards = [...document.querySelectorAll("#localConverterGrid > .card")];
let activeToolCategory = "all";

function updateToolResults() {
  const query = toolSearch.value.trim().toLowerCase();
  let visibleCount = 0;

  toolCards.forEach((card) => {
    const categoryMatches =
      activeToolCategory === "all" ||
      card.dataset.category === activeToolCategory;
    const matchesQuery = card.textContent.toLowerCase().includes(query);
    const isVisible = categoryMatches && matchesQuery;

    card.classList.toggle("tool-card-hidden", !isVisible);
    if (isVisible) visibleCount += 1;
  });

  toolResultsCount.textContent = `${visibleCount} ${
    visibleCount === 1 ? "tool" : "tools"
  } available`;
  toolEmptyState.hidden = visibleCount > 0;
}

toolSearch.addEventListener("input", updateToolResults);

toolFilters.forEach((filter) => {
  filter.addEventListener("click", () => {
    activeToolCategory = filter.dataset.category || "all";
    toolFilters.forEach((button) => {
      const isActive = button === filter;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
    updateToolResults();
  });
});

updateToolResults();
