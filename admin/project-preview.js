/* Render the Jekyll project layout with the same includes in the browser. */
(() => {
  let enginePromise;
  function engine() {
    if (!enginePromise) enginePromise = fetch('./editor-templates.json').then(async (response) => {
      if (!response.ok) throw new Error('Could not load project preview templates.');
      const templates = await response.json();
      const fs = {
        resolve: (_root, file) => file.startsWith('_') ? file : `_includes/${file}`,
        exists: async (file) => Object.hasOwn(templates, file),
        existsSync: (file) => Object.hasOwn(templates, file),
        readFile: async (file) => templates[file],
        readFileSync: (file) => templates[file],
        dirname: () => '',
        contains: () => true,
        sep: '/',
      };
      const liquid = new window.AdminVendor.Liquid({ jekyllInclude: true, fs });
      // Ruby Liquid truncates division by an integer; LiquidJS otherwise keeps fractions.
      liquid.registerFilter('divided_by', (value, divisor) => Number.isInteger(divisor) ? Math.floor(value / divisor) : value / divisor);
      liquid.registerFilter('relative_url', (value) => {
        if (/^(?:data:|blob:|https?:)/.test(value)) return value;
        return `${window.ADMIN_BASEURL || ''}/${String(value || '').replace(/^\//, '')}`;
      });
      liquid.registerFilter('date_to_long_string', (value) => value
        ? new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value)) : '');
      return { liquid, template: templates['_layouts/project.html'] };
    }).catch((error) => { enginePromise = null; throw error; });
    return enginePromise;
  }
  window.renderProjectPreview = async (project, body) => {
    const { liquid, template } = await engine();
    const page = { ...project, gallery: project.gallery.map((item) => ({ ...item, image: item.preview || item.image })) };
    return liquid.parseAndRender(template, { page, content: body });
  };
})();
