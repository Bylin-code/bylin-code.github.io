# Render edge-case gallery fixtures through the real Jekyll/Liquid engine.
require 'bundler/setup'
require 'jekyll'
require 'json'
Jekyll.logger.log_level = :error
site = Jekyll::Site.new(Jekyll.configuration('source' => Dir.pwd, 'destination' => '/tmp/bylin-fixture-build', 'quiet' => true))
site.read
fixtures = []
%w[split rows editorial masonry hero filmstrip].each do |style|
  [false, true].each do |flip|
    [1, 5, 10].each do |count|
      page = { 'title' => 'Fixture', 'date' => '2026-10-21', 'description' => 'Description', 'role' => 'Designer', 'gallery_style' => style, 'gallery_flip' => flip, 'gallery_count' => count,
               'gallery' => (1..count).map { |n| { 'image' => "/image#{n}.jpg", 'alt' => "Image #{n}", 'caption' => "Caption #{n}" } } }
      payload = site.site_payload.merge('page' => page, 'content' => '<p>Fixture body</p>')
      html = site.liquid_renderer.file('_layouts/project.html').parse(site.layouts['project'].content).render!(payload, registers: { site: site, page: page })
      fixtures << { page: page, html: html }
    end
  end
end
puts JSON.generate(fixtures)
