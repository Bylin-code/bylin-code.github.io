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

- `index.md`: homepage content
- `pages/`: standalone pages
- `collections/_projects/`: portfolio projects
- `collections/_posts/`: blog posts
- `_data/menu.yml`: header and footer navigation
- `_data/social.json`: footer social links
- `_config.yml`: global site settings
- `assets/images/my-projects/<project-name>/`: project images

## Add a project

1. Create an image folder, such as `assets/images/my-projects/my-project/`.
2. Create `collections/_projects/my-project.md`.
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

Create `pages/page-name.md`:

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
- Confusing homepage edits: `index.md` is the canonical homepage; `pages/home.md` is retained legacy content and should not be edited.
