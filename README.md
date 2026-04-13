# Drupal Issue Explorer

> Explore and visualize the relationships between Drupal.org issues as an interactive graph.

![Drupal Issue Explorer](assets/screenshot.png)

---

## What is it?

The Drupal Issue Explorer maps the dependency graph of issues on Drupal.org and lets you navigate them visually. Starting from any issue, you can see which issues it depends on, which issues reference it, and how far the web of relationships extends — all rendered as an interactive, zoomable force-directed graph.

It's useful for:
- Understanding the full impact of a meta issue before diving in
- Finding blocking or blocked issues
- Spotting orphaned issues that have no connections
- Getting a bird's-eye view of what's happening in Drupal Core, Experience Builder, or Drupal CMS

---

## Features

### Graph Visualization

- **2D and 3D** force-directed graph — toggle between modes with the switch in the bottom-left corner
- **Node size** reflects how many issues reference this issue (the more referenced, the larger)
- **Color-coded by status**: Active (red), Needs Review (teal), Needs Work (orange), Reviewed & Tested (dark blue), Fixed / Closed (grey), and more
- **Color-coded relationship types**:
  - Purple — **PARENT** relationship
  - Green — **CHILD** relationship
  - Red/pink — **RELATED** relationship
  - Blue — **MENTIONED** relationship
- Closed issues appear at reduced opacity so open issues stand out
- Pan, zoom, and drag the canvas freely

### Search & Navigation

- **Full-text fuzzy search** across all issue titles — results appear as you type
- Set any issue as the **Root Node** to re-center the graph around it
- Control graph depth with the **Hops** field — how many levels of relationships to load from the root (default: 2)
- **Toggle closed** button to show or hide resolved issues
- Browser **back/forward** navigation works as expected

### Show All for Project

Load the complete issue graph for an entire project in one click:

- Drupal Core
- Experience Builder
- Drupal CMS

### Statistics & Analytics

The **Statistics and lists** dropdown gives you four analytical views:

| View | Description |
|------|-------------|
| **Orphan Issues by Status** | Issues with no relationships, broken down by status |
| **Component Issues** | All issues grouped by component with open/closed counts |
| **Most Referenced Issues** | Issues ranked by how many others link to them |
| **Meta Issues** | All issues tagged with `[meta]` in their title |

Each view opens as a sortable table — click any column header to sort.

### Issue Detail Panel

Clicking an issue shows its details in the right sidebar:

- Status, component, and category
- Created and last modified dates
- Comment count
- Distance in hops from the root node

---

## Getting Started

You need [DDEV](https://ddev.readthedocs.io/en/stable/) installed.

```shell
git clone https://github.com/bbrala/drupal-issue-explorer.git
cd drupal-issue-explorer
ddev start
ddev neo4j-import
ddev launch
```

That's it. DDEV will build the frontend automatically on start, and `ddev neo4j-import` loads the pre-exported Neo4j database. The browser opens to the running app.

> The data is exported from Drupal.org weekly and committed to this repository, so you always have a recent snapshot without needing to fetch anything from the API.

---

## Supported Projects

| Project | Drupal.org ID |
|---------|--------------|
| Drupal Core | 3060 |
| Experience Builder | 3437806 |
| Drupal CMS | 3466979 |

---
