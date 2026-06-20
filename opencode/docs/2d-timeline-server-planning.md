# 2D Timeline Server-Side Planning

## Goal

Build the main `/` page as a horizontal 2D timeline of Western European art history.

The page should show historical art periods, movements, and visual artists. Each artist appears as a small avatar/card. Clicking an artist opens the existing 3D room route:

```txt
/room?author=AUTHOR_NAME
```

`AUTHOR_NAME` must always be the English artist name because the 3D room currently resolves artists through Wikidata/Wikipedia using English-friendly names.

## Current Decision

For the first implementation, the timeline should fetch data server-side at request time, similar to the current `/room` implementation.

Do not generate local JSON yet. A generated JSON/data cache phase can be added later after the Wikipedia queries and artist list are stable.

## MVP Scope

- Render the homepage timeline at `/`.
- Keep the timeline horizontal on desktop and mobile.
- Focus on Western European art history first.
- Show periods in chronological order.
- Show movements inside periods where useful.
- Show artist avatars with small thumbnails.
- Provide fallbacks for missing portraits.
- Support filters for period, movement, and author search.
- Navigate directly to `/room?author=English Artist Name` when an artist is selected.
- Fetch and normalize Wikipedia data server-side only.

## Out Of Scope For This Phase

- Generated JSON files.
- Client-side Wikipedia/Wikimedia calls.
- HTML scraping.
- Full global art history coverage.
- Automatic discovery of every artist in Wikipedia.
- Complex timeline virtualization unless the initial dataset proves too large.
- Artist detail pages between the timeline and the 3D room.

## Suggested User Flow

1. User opens `/`.
2. Server loads curated timeline seeds.
3. Server enriches artists with Wikipedia data.
4. Page renders one continuous horizontal art-history timeline.
5. User jumps to a period or movement, or filters visible artists by author name.
6. User clicks an artist avatar/card.
7. Browser navigates to `/room?author=AUTHOR_NAME`.

## Data Strategy

Use a curated seed list first. The seed should define the intended historical structure instead of relying on Wikipedia categories to discover artists automatically.

Recommended seed shape:

```ts
type TimelinePeriodSeed = {
	id: string;
	name: string;
	startYear: number;
	endYear: number;
	description?: string;
	movements: TimelineMovementSeed[];
};

type TimelineMovementSeed = {
	id: string;
	name: string;
	startYear?: number;
	endYear?: number;
	artistNames: string[];
};
```

The seed list should use English names for artists, for example `Leonardo da Vinci`, `Michelangelo`, `Rembrandt`, and `Claude Monet`.

## Suggested Initial Historical Coverage

Start small and curated. Expand only after the UI and server loader are stable.

Possible first periods:

- Medieval Art
- Renaissance
- Baroque
- Rococo
- Neoclassicism
- Romanticism
- Realism
- Impressionism
- Post-Impressionism
- Symbolism
- Expressionism
- Cubism
- Surrealism
- Abstract / Modern Art

The list should not try to be academically complete in the first pass. The goal is a stable visual timeline and clean data flow.

## Wikipedia / MediaWiki Fetching

The server loader should enrich artists using free public Wikipedia/MediaWiki APIs only.

Recommended endpoint:

```txt
https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages|info&exintro=1&explaintext=1&inprop=url&pithumbsize=160&titles={titles}&format=json&formatversion=2&origin=*
```

Use it for:

- Canonical Wikipedia URL.
- Short intro extract.
- Small portrait thumbnail.
- Page title normalization.

Implementation notes:

- Batch multiple titles in one request when possible.
- Keep thumbnails small, around `120` to `160` px.
- Avoid full-size images on the timeline.
- Add a clear user agent in server-side requests.
- Normalize all responses before they reach Svelte components.
- Do not scrape Wikipedia HTML.

## Normalized Timeline Types

The timeline can use its own domain types and does not need to reuse the 3D room types.

Suggested types:

```ts
type TimelineArtist = {
	id: string;
	name: string;
	periodId: string;
	movementId: string;
	birthYear?: number;
	deathYear?: number;
	description?: string;
	thumbnailUrl?: string;
	sourceUrl?: string;
};

type TimelineMovement = {
	id: string;
	name: string;
	periodId: string;
	startYear?: number;
	endYear?: number;
	artists: TimelineArtist[];
};

type TimelinePeriod = {
	id: string;
	name: string;
	startYear: number;
	endYear: number;
	description?: string;
	movements: TimelineMovement[];
};

type TimelineData = {
	periods: TimelinePeriod[];
	loadedAt: string;
};
```

## Navigation And Filters

First-pass controls:

- Period select for smooth horizontal navigation.
- Movement select for smooth horizontal navigation.
- Author text search.

Author filtering should happen client-side after the server returns normalized timeline data. This keeps interactions instant and avoids repeated server calls while the user explores.

Navigation/filter behavior:

- Empty filters show all periods and artists.
- Selecting a period does not hide unrelated periods; it scrolls smoothly to that period on the continuous timeline.
- Selecting a movement does not hide unrelated movements; it scrolls smoothly to that movement on the continuous timeline.
- `All periods` and `All movements` scroll back toward the beginning of the timeline.
- Author search matches artist names case-insensitively.
- Author search is the only control that removes artist cards from the visible timeline.
- If author search removes all artists, show a compact empty state.

## Loading And Performance

Server-side loading should stay predictable and bounded.

Recommended rules:

- Use a curated artist count for the MVP.
- Batch Wikipedia requests by title.
- Use small thumbnails only.
- Normalize and return only the fields needed by the timeline.
- Avoid passing raw API responses to the client.
- Consider an in-memory TTL cache in the server module if repeated local navigation becomes slow.
- Add generated JSON later only after the data shape is stable.

If the initial artist count grows beyond roughly 100 artists, revisit rendering strategy. Until then, a simple horizontal layout should be enough.

## UI Guidelines

- Timeline must remain horizontal on all screen sizes.
- On mobile, use horizontal overflow instead of stacking vertically.
- The main visual should be a single continuous horizontal line, not independent period cards.
- Artist position on the x-axis should be based on `birthYear` when available.
- If an artist is missing `birthYear`, fall back to movement start/end or the period midpoint.
- Movements should visually affect the timeline line, for example through colored segments or accents.
- Periods should appear as contextual labels/bands along the axis, not as the primary card layout.
- Artist avatars should be compact, readable, keyboard-accessible, and placed near their timeline point.
- Artists close in time can form compact bubble/grid clusters around the same timeline area.
- Period and movement controls should use smooth horizontal scroll behavior instead of filtering timeline content.
- Vertical mouse wheel should translate into horizontal scroll only when the cursor is over the timeline region.
- Header should be sticky/fixed and compact, containing only the title, a short message, filters, and count.
- Avatar image should use `loading="lazy"`, explicit dimensions, and `alt` text.
- Missing portraits should render initials or a neutral silhouette fallback.
- Do not rely on hover-only interactions.
- Keep the visual style calm, museum-like, and readable.

## Suggested Files

- `src/lib/data/timeline-seed.ts`
- `src/lib/server/timeline.ts`
- `src/lib/types/timeline.ts`
- `src/routes/+page.server.ts`
- `src/routes/+page.svelte`

Optional components after the first pass:

- `src/lib/components/timeline/TimelineFilters.svelte`
- `src/lib/components/timeline/TimelinePeriod.svelte`
- `src/lib/components/timeline/TimelineArtistAvatar.svelte`

## Acceptance Criteria

- `/` renders a continuous horizontal timeline from server-loaded normalized data.
- Periods are chronological.
- Artists are positioned by birth year on the timeline.
- Movements are represented visually through colored line segments or accents.
- Periods appear as contextual chronological labels/bands.
- Period and movement controls scroll smoothly to their target timeline locations.
- Author search filters visible artist cards by name.
- Mouse wheel over the timeline scrolls horizontally.
- Artist thumbnails are small and lazy-loaded.
- Missing portraits have fallbacks.
- Clicking an artist navigates to `/room?author=AUTHOR_NAME`.
- `AUTHOR_NAME` is always the English display name from the curated seed/normalized data.
- No Svelte component calls Wikipedia directly.
- No raw Wikipedia responses reach the UI.
- No generated JSON is required in this phase.

## Later Improvements

- Add local generated JSON once the curated seed and API normalization are stable.
- Improve queries with Wikidata identifiers for dates, nationality, movement, and disambiguation.
- Add broader non-European art history in a separate phase.
- Add smarter cache invalidation or persistent generated data.
- Add virtualization only if the artist count becomes large enough to justify it.
