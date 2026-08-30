# Brady Y. Lin — Portfolio

Personal portfolio built with Jekyll and deployed from this repository.

## Local development

Requirements:

- Ruby 3.2.2 (the version used by Netlify)
- Bundler

Install the project dependencies once:

```sh
bundle install
```

Start the local development server:

```sh
bundle exec jekyll serve --livereload
```

### Project editor

With the local server running, open `http://localhost:4000/admin/`. The editor
loads every file in `content/_projects`, lets you select one of the rigid
project layouts, edit its fields and Markdown, preview YouTube includes, and
fill the template's image slots.

The six template definitions live in `_data/project_templates.yml`. Their slot
order is the order of the `gallery` items in project front matter. YouTube
embeds use `{% include youtube.html id="VIDEO_ID" %}`.

The current editor phase can save a browser-local draft or download the
resulting `.md` file. Uploaded images are preview-only until the authenticated
GitHub publishing phase is implemented; no access token is stored in the site.

Open <http://127.0.0.1:4000>. Jekyll rebuilds after saved changes, and LiveReload refreshes the browser when supported.

To expose the preview to other devices on the same network:

```sh
bundle exec jekyll serve --livereload --host 0.0.0.0
```

## Production build

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

The generated site is written to `_site/`.

## Content locations

- `content/pages/home.md`: homepage content
- `content/pages/`: standalone pages
- `content/_projects/`: portfolio projects
- `_data/menu.yml`: header and footer navigation
- `_data/social.json`: footer social links
- `_includes/layout/`: page-shell sections such as the header and footer
- `_includes/navigation/`: menus, logo, and mobile navigation controls
- `_includes/components/`: reusable portfolio interface components
- `_includes/meta/`: metadata, fonts, analytics, and cookie integrations
- `_sass/base/`: typography, content, colors, and other global styles
- `_sass/layout/`: page-shell and grid styles
- `_sass/navigation/`: logo and menu styles
- `_sass/components/`: reusable portfolio component styles
- `_sass/pages/`: page-specific styles
- `_sass/vendor/`: third-party Bootstrap and Font Awesome source
- `_config.yml`: global site settings
- `assets/images/my-projects/<project-name>/`: project images

## Add a project

1. Create an image folder, such as `assets/images/my-projects/my-project/`.
2. Create `content/_projects/my-project.md`.
3. Add front matter using an existing project with the desired gallery arrangement as a reference.

Minimal example:

```yaml
---
layout: project-3p
title: "My Project"
description: "A short description shown on project cards and the project page."
date: 2026-08-29
featured: false
display: true
role: "Engineer"
skills: "CAD, Embedded systems, Prototyping"
thumbnail: "/assets/images/my-projects/my-project/thumbnail.jpg"
gallery:
  - image: "/assets/images/my-projects/my-project/image-1.jpg"
    caption: "<strong>Fig 1:</strong> A useful description of the image"
---

Long-form project notes can go here in Markdown.
```

Project flags:

- `display: true` shows the project in the main project listing.
- `featured: true` also makes it eligible for the homepage's featured section.
- `date` controls date-based ordering.

The current project layouts are `project-2p` through `project-7p`. They describe gallery arrangements rather than enforcing an exact image count.

## Add a standalone page

Create `content/pages/page-name.md`:

```yaml
---
layout: basic
title: "Page Name"
permalink: "/page-name/"
---

Page content goes here.
```

Add it to `_data/menu.yml` only if it should appear in navigation.

## Troubleshooting

- `bundler: command not found: jekyll`: run `bundle install` first.
- Dependency errors after changing Ruby versions: run `bundle install` again with Ruby 3.2.2 active.
- A missing image: confirm the front-matter path matches the filename exactly, including capitalization.
- The canonical homepage is `content/pages/home.md`.
