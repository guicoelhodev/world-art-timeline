I want to start a project using SvelteKit + Tailwind CSS + Threlte.

The idea is to build an interactive timeline of visual artists and their artworks. The data should come from free Wikipedia/Wikimedia sources, without HTML scraping and without paid APIs.

The project has two main experiences:

1. 2D Timeline
- Show visual artists organized by historical time period.
- Each artist should appear on an interactive timeline.
- The user can click an artist to open their detail page.
- The project should start with a small curated list of artists.
- Initial data can be mocked/seeded locally.

2. 3D Exhibition Room
- From an artist page, the user can enter a 3D exhibition room.
- The room should feel like a simple art gallery/museum exhibition.
- The artist’s artworks should be rendered as framed paintings on the wall.
- Clicking an artwork should open an HTML overlay explaining the artwork.
- I want to use Threlte because I am already familiar with it.
- The 3D room should be simple for the MVP: no complex physics, no multiplayer, no heavy realism.

Desired stack:
- SvelteKit
- TypeScript
- Tailwind CSS
- Threlte
- Free data sources: Wikipedia, Wikimedia Commons, Wikidata when useful
- Local seed data first
- Generated local JSON data in a later phase
- No database for the MVP
- No custom backend for the MVP
- No login/auth for the MVP

Current goal:
Do not implement the project yet.

I want you to plan the project and create the necessary internal documentation files inside `/docs`, so future OpenCode agent runs can execute the project in small, safe phases.

Create at least these markdown files:

- `/docs/00-product-vision.md`
- `/docs/01-roadmap.md`
- `/docs/02-data-model.md`
- `/docs/03-data-source-strategy.md`
- `/docs/04-wikipedia-wikimedia-integration.md`
- `/docs/05-ui-guidelines.md`
- `/docs/06-3d-exhibition-room.md`
- `/docs/07-agent-rules.md`
- `/docs/08-task-breakdown.md`

The documentation should cover:

## 1. Product Vision

Explain:
- What the project is.
- The core user experience.
- What is inside the MVP scope.
- What is outside the MVP scope.
- The target audience and purpose of the project.

The initial focus should be on visual artists, not generic “authors”, because the main experience is a 3D gallery with visual artworks.

## 2. Roadmap

Split the project into small phases.

Required order:
1. Static MVP with local mocked/seeded data.
2. 2D timeline and artist detail pages.
3. Artwork overlay in regular HTML.
4. Wikipedia/Wikimedia data enrichment.
5. Generated local JSON files.
6. 3D exhibition room with Threlte.
7. UX refinement and polish.

Do not start with Wikipedia integration or Threlte before the basic data model, pages, and timeline are stable.

## 3. Data Model

Define the main TypeScript domain models, including:

- `Artist`
- `Artwork`
- `Period`
- `SourceMetadata`
- loading/error/fallback states where useful

Important rules:
- UI components must not consume raw Wikipedia/Wikimedia API responses directly.
- All external data must go through a normalization layer before reaching the UI.
- The data model must tolerate missing data.
- Every external entity should keep a `sourceUrl` when available.

## 4. Data Source Strategy

Document the preferred data flow:

1. Keep a curated local list of artists and artworks.
2. Run a local script to fetch/enrich data from free Wikipedia/Wikimedia sources.
3. Normalize the data into our domain models.
4. Save the result as generated local JSON files.
5. The SvelteKit app consumes those local JSON files.

Important:
- The frontend should not call Wikipedia/Wikimedia APIs on every user visit.
- Avoid runtime dependency on external APIs for the MVP.
- Keep the project free to run and deploy.

## 5. Wikipedia/Wikimedia Integration

Document:
- Do not use HTML scraping.
- Use public Wikimedia/Wikipedia APIs when needed.
- Use Wikimedia Commons for images when available.
- Consider Wikidata in a future phase for structured metadata.
- Always store `sourceUrl`.
- Always handle missing fields.
- Always provide visual/textual fallbacks.
- Respect usage guidelines and rate limits.
- Do not fetch data directly inside Svelte components.

## 6. UI/UX Guidelines

Define guidelines for:

- 2D timeline
- artist cards
- artist detail page
- artwork cards
- artwork overlay
- responsive behavior
- loading states
- empty states
- error states
- visual direction

The visual direction should feel like a clean, modern museum/gallery interface. Keep it simple, elegant, readable, and not overdesigned.

## 7. Threlte 3D Exhibition Room

Document the MVP:

- A simple rectangular room.
- One or more gallery walls.
- Artworks rendered as planes/textures inside frames.
- Clicking an artwork opens an HTML overlay outside the canvas.
- The scene receives normalized data through props.
- The scene must not fetch data directly.
- The 3D code should be isolated from the regular UI code.

Suggested components:

- `ExhibitionScene.svelte`
- `Room.svelte`
- `GalleryWall.svelte`
- `ArtworkFrame.svelte`
- `CameraControls.svelte`
- `ArtworkOverlay.svelte`

Also document what not to do in the MVP:
- no complex physics
- no multiplayer
- no GLTF-heavy museum models
- no advanced post-processing
- no realistic walking simulation unless explicitly requested later

## 8. Agent Rules

Create clear rules for future OpenCode agent runs:

- Work in small tasks.
- Do not implement multiple roadmap phases at once.
- Do not add dependencies without a clear reason.
- Keep documentation updated when decisions change.
- Do not change the data model without updating `/docs/02-data-model.md`.
- Do not mix API/data-fetching logic with UI components.
- Do not fetch Wikipedia/Wikimedia data inside Svelte components.
- Use TypeScript.
- Keep Svelte components small and typed.
- Add loading, empty, error, and fallback states where relevant.
- Prefer boring, maintainable code over clever abstractions.

## 9. Task Breakdown

Create a task breakdown for future implementation.

Each task should include:

- goal
- likely files to create/modify
- acceptance criteria
- what not to do in that task

The tasks should be ordered so an agent can execute them safely one at a time.

Expected output:
- Create the markdown files inside `/docs`.
- Do not implement application code yet.
- Do not install dependencies yet.
- Do not create Svelte components yet.
- At the end, provide a summary of the created docs and recommend the first implementation task.
