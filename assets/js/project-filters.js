(() => {
  const browser = document.querySelector('[data-project-browser]');
  if (!browser) return;
  const filters = browser.querySelector('.project-filters');
  const cards = [...browser.querySelectorAll('[data-project-type]')].map((element) => ({
    element,
    type: element.dataset.projectType,
    contributions: JSON.parse(element.dataset.contributions || 'null') || [],
  }));
  const selected = { type: '', contribution: '' };
  function update() {
    let count = 0;
    cards.forEach(({ element, type, contributions }) => {
      const matches = (!selected.type || selected.type === type)
        && (!selected.contribution || contributions.includes(selected.contribution));
      element.hidden = !matches;
      if (matches) count++;
    });
    filters.querySelectorAll('[data-filter-group]').forEach((group) => {
      group.querySelectorAll('button').forEach((button) => {
        button.setAttribute('aria-pressed', String(button.dataset.value === selected[group.dataset.filterGroup]));
      });
    });
    filters.querySelector('[data-filter-status]').textContent = `${count} of ${cards.length} projects`;
    filters.querySelector('[data-filter-empty]').hidden = count !== 0;
    filters.querySelector('[data-filter-reset]').hidden = !selected.type && !selected.contribution;
  }
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-filter-reset')) {
      selected.type = '';
      selected.contribution = '';
    } else {
      const group = button.closest('[data-filter-group]');
      if (!group) return;
      selected[group.dataset.filterGroup] = button.dataset.value;
    }
    update();
  });
  update();
  filters.hidden = false;
})();
