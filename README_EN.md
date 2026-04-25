<div align="center">

# AO3 Workskin Sandbox

> A local AO3-style editing and preview sandbox for quickly testing workskin behavior.

[![Status](https://img.shields.io/badge/status-local%20demo-blue)]()
[![Stack](https://img.shields.io/badge/stack-HTML%2FCSS%2FJS-orange)]()
[![Storage](https://img.shields.io/badge/storage-localStorage-green)]()
[![Responsive](https://img.shields.io/badge/responsive-62em%20%2F%2042em-purple)]()

<br>

This project is built for AO3 authors.  
When AO3 is down, login is temporarily unavailable, or you want faster local iteration, this sandbox lets you draft and validate workskin behavior before posting.
This project is implemented as a localized extension built on top of AO3's official open-source code published on GitHub, adapted for local author testing workflows.

[Features](#features) · [Quick Start](#quick-start) · [Workflow](#workflow) · [Differences vs AO3](#differences-vs-ao3) · [Project Structure](#project-structure)

</div>

---

## Features

- AO3-style `Edit Work` page (local static mode)
- AO3-style standalone `Preview` page (header meta + chapter body + comments area)
- `Save Draft`: save to localStorage and auto-jump to preview
- `Preview`: save to localStorage and jump to preview
- `Edit` (inside preview): return to editor with draft hydration
- `Tags and Language` data binding into preview
- `Change creator's name?` binding:
  - preview byline
  - top-right greeting (`Hi, ...!`)
- Local `Work Skin` testing workflow for quick style checks
- AO3-style `Kudos` / `Comments` / `Hide Comments` interactions (local simulation)
- Responsive behavior inspired by AO3 breakpoints:
  - `max-width: 62em`
  - `max-width: 42em`

---

## Quick Start

1. Clone or download this repository
2. Double-click `open-local.bat` (recommended)
3. Your browser will auto-open `http://127.0.0.1:8000/index.html`

`open-local.bat` prefers Python; if Python is not installed, it automatically falls back to a built-in Windows PowerShell static server.

Fallback:

1. Run `py -m http.server 8000` in the project folder
2. Open `http://127.0.0.1:8000/index.html` in your browser

> Note: Rich Text depends on TinyMCE CDN. In offline mode, it falls back to HTML editing.
> Note: `localhost` always means the current machine, so each user must run `open-local.bat` on their own computer.

---

## Workflow

1. Fill content in `index.html` (`Tags and Language`, chapter text, Work Skin, etc.)
2. Click `Save Draft` or `Preview` to persist draft and open `chapter-preview.html`
3. Validate typography, layout, and skin behavior in preview
4. Click `Edit` to go back and continue editing with the same draft

---

## Differences vs AO3

This project is a local validation sandbox, not a full AO3 backend clone.

- Aligned with AO3:
  - page style and major interaction placement
  - typical editing/preview flow
  - responsive breakpoint strategy (`62em` / `42em`)

- Different from AO3:
  - `Work Skin` here is local CSS injection for preview, not AO3's `work_skin_id` selection + server-side sanitization pipeline
  - everything is local-only (no account, no server, no real posting)
  - `Kudos` and comments interactions are simulated and not synced anywhere

---

## Use Cases

- Quickly test whether a CSS/workskin idea behaves as expected in an AO3-like page
- Keep drafting and previewing while AO3 is temporarily unavailable
- Run a local preflight check before posting (text + tags + style)

---

## Project Structure

```text
ao3-workskin-sandbox/
|- index.html              # Local editor page (Edit Work style)
|- ao3.css                 # Editor overrides
|- ao3.js                  # Editor logic (save/hydrate/redirect)
|- chapter-preview.html    # Local preview page
|- chapter-preview.css     # Preview overrides
|- chapter-preview.js      # Preview rendering and interactions
|- site/2.0/               # AO3-style base styles
`- images/                 # Local image assets
```

---

## Notes

- This is a local demo and not an official AO3 product.
- Drafts are stored in browser localStorage; clearing storage or switching browsers loses visibility of saved drafts.
- Keep an external backup of your writing.
