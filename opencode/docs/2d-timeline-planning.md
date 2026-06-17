# 2D Timeline Planning

## Goal

Build a clean, readable 2D timeline that lets users explore visual artists by historical period, then open an artist detail page from each timeline item.

The timeline is the first core experience and should be stable before Wikipedia/Wikimedia enrichment or the 3D exhibition room are implemented.

## MVP Scope

- Show a curated list of visual artists grouped by period.
- Display each artist with name, lifespan, short description, movement or period, and optional portrait image.
- Allow users to click an artist and navigate to an artist detail page.
- Use local seed data first.
- Use generated local JSON after the data enrichment phase.
- Provide fallback UI for missing dates, images, descriptions, or source metadata.

## Out Of Scope For MVP

- Runtime Wikipedia API calls from Svelte components.
- Infinite timelines with large datasets.
- User accounts, saved artists, comments, or social features.
- Complex animated timeline physics.
- Automatic discovery of all artists from Wikipedia.

## Suggested User Flow

1. User opens the timeline page.
2. User sees periods in chronological order.
3. User scans artist cards positioned inside their period.
4. User clicks an artist card.
5. User lands on the artist detail page.
6. User can later enter the artist's 3D exhibition room from the detail page.

## Data Requirements

The timeline should consume normalized project data only.

Required artist fields:

- `id`
- `slug`
- `name`
- `birthYear`
- `deathYear`
- `periodIds`
- `shortDescription`
- `portraitImageUrl`
- `sourceUrl`
- `sources`

Required period fields:

- `id`
- `name`
- `startYear`
- `endYear`
- `description`

The UI must tolerate missing values. Unknown death dates should support living artists or incomplete historical records.

## Free Wikipedia/Wikimedia Data Plan

Use only free public Wikimedia APIs and generated local files.

Preferred flow:

1. Keep a curated local seed list of artist names and optional Wikipedia page titles.
2. Run a local Node/TypeScript script from the developer machine.
3. Fetch data from public Wikipedia/Wikimedia endpoints.
4. Normalize raw responses into the app domain models.
5. Save generated JSON into the project.
6. The SvelteKit app imports or loads the generated JSON locally.

Do not fetch Wikipedia or Wikimedia data directly inside timeline components.

## Free APIs To Use

Wikipedia REST summary endpoint for artist summaries:

```txt
https://en.wikipedia.org/api/rest_v1/page/summary/{pageTitle}
```

Use it for:

- Artist display title.
- Short extract.
- Wikipedia page URL.
- Thumbnail image when available.

MediaWiki Action API for page images and metadata:

```txt
https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|info&inprop=url&pithumbsize=600&titles={pageTitle}&format=json&origin=*
```

Use it for:

- Portrait thumbnails.
- Canonical page URLs.
- Page metadata.

Wikidata can be added later for structured dates and identifiers:

```txt
https://www.wikidata.org/w/api.php?action=wbsearchentities&search={artistName}&language=en&format=json&origin=*
```

Use Wikidata carefully because entity matching requires validation. Prefer curated IDs when possible.

## Data Fetching Rules

- Use public Wikimedia/Wikipedia APIs only.
- Do not scrape HTML.
- Do not use paid APIs.
- Respect Wikimedia rate limits and identify the app with a clear user agent when using server-side scripts.
- Cache generated results locally as JSON.
- Store `sourceUrl` for every enriched artist.
- Preserve the original seed ID so generated data remains stable.
- Handle missing images and descriptions without failing generation.

## Timeline UI Guidelines

- Use a museum/gallery visual style: calm, spacious, readable, and not overdesigned.
- Sort periods chronologically.
- Sort artists by birth year when available.
- Keep artist cards compact but informative.
- Use horizontal layout on desktop if it remains readable.
- Use vertical stacked layout on mobile.
- Avoid relying on hover-only interactions.
- Make cards keyboard-accessible.
- Show source attribution on artist detail pages, not necessarily on every card.

## Suggested Files Later

- `src/lib/data/seed/artists.ts`
- `src/lib/data/seed/periods.ts`
- `src/lib/data/generated/artists.json`
- `src/lib/data/generated/periods.json`
- `src/lib/types/domain.ts`
- `src/lib/data/normalizeArtist.ts`
- `scripts/enrich-artists.ts`
- `src/routes/+page.svelte`
- `src/routes/artists/[slug]/+page.svelte`

## Acceptance Criteria

- Timeline renders from local normalized data.
- Artists are grouped or visually associated with periods.
- Clicking an artist opens the artist detail page.
- Missing dates, descriptions, portraits, and sources have fallbacks.
- No Svelte component calls Wikipedia, Wikimedia Commons, or Wikidata directly.
- Generated data includes source URLs when available.
