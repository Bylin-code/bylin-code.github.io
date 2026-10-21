# Export the actual project templates for the browser editor. No second layout
# implementation is maintained in JavaScript. Runs in the existing Jekyll builds.
require 'json'

Jekyll::Hooks.register :site, :post_read do |site|
  templates = {}
  paths = ['_layouts/project.html'] + Dir.glob(File.join(site.source, '_includes/project/*.html')).map { |path| path.delete_prefix("#{site.source}/") }
  paths.each do |path|
    templates[path] = File.read(File.join(site.source, path)).sub(/\A---\s*\n.*?\n---\s*\n/m, '')
  end
  page = Jekyll::PageWithoutAFile.new(site, site.source, 'admin', 'editor-templates.json')
  page.content = JSON.generate(templates)
  page.data['layout'] = nil
  # Raw Liquid is JSON data; do not evaluate the exported templates a second time.
  def page.render_with_liquid?
    false
  end
  site.pages << page
end
