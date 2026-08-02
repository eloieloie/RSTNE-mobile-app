# Graph Report - RSTNE-mobile-app  (2026-08-02)

## Corpus Check
- 53 files · ~176,378 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 115 nodes · 119 edges · 21 communities (7 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `7fb2a17f`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- ReadingView.vue
- package.json
- devDependencies
- dependencies
- applyPendingScroll
- openVersePreview
- @capacitor/android
- @capacitor/app
- @capacitor/browser
- @capacitor-community/in-app-review
- @capacitor/filesystem
- @capacitor/haptics
- @capacitor/ios
- @capacitor/push-notifications
- @capacitor/share
- @capacitor/status-bar
- motion-v
- vue
- vue-router
- acquireWakeLock

## God Nodes (most connected - your core abstractions)
1. `scripts` - 7 edges
2. `openVersePreview()` - 4 edges
3. `applyPendingScroll()` - 3 edges
4. `retryLoad()` - 3 edges
5. `@capacitor-community/in-app-review` - 2 edges
6. `@capacitor/android` - 2 edges
7. `@capacitor/app` - 2 edges
8. `@capacitor/browser` - 2 edges
9. `@capacitor/core` - 2 edges
10. `@capacitor/filesystem` - 2 edges

## Surprising Connections (you probably didn't know these)
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (21 total, 14 thin omitted)

### Community 0 - "ReadingView.vue"
Cohesion: 0.04
Nodes (37): allBooks, bookAbbreviations, bookId, chapterId, chapters, copiedVerseId, crossRefSheet, currentBook (+29 more)

### Community 1 - "package.json"
Cohesion: 0.17
Nodes (11): name, private, scripts, build, cap:android, cap:ios, cap:sync, dev (+3 more)

### Community 2 - "devDependencies"
Cohesion: 0.18
Nodes (11): @capacitor/cli, devDependencies, @capacitor/cli, typescript, vite, @vitejs/plugin-vue, vue-tsc, typescript (+3 more)

### Community 3 - "dependencies"
Cohesion: 0.40
Nodes (5): @capacitor/core, @capacitor/keyboard, dependencies, @capacitor/core, @capacitor/keyboard

### Community 4 - "applyPendingScroll"
Cohesion: 0.50
Nodes (4): applyPendingScroll(), goToCrossRef(), loadVerses(), retryLoad()

### Community 5 - "openVersePreview"
Cohesion: 0.50
Nodes (4): handleCrossRefBodyClick(), handleInlineVerseClick(), openCrossRef(), openVersePreview()

## Knowledge Gaps
- **67 isolated node(s):** `name`, `version`, `private`, `type`, `dev` (+62 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `package.json`, `@capacitor/android`, `@capacitor/app`, `@capacitor/browser`, `@capacitor-community/in-app-review`, `@capacitor/filesystem`, `@capacitor/haptics`, `@capacitor/ios`, `@capacitor/push-notifications`, `@capacitor/share`, `@capacitor/status-bar`, `motion-v`, `vue`, `vue-router`?**
  _High betweenness centrality (0.172) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.073) - this node is a cross-community bridge._
- **What connects `name`, `version`, `private` to the rest of the system?**
  _67 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ReadingView.vue` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._