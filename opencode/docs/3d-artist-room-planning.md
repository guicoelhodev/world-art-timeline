# 3D Artist Room Planning

## Goal

Build a simple Threlte-powered exhibition room for a selected artist. The room should display the artist's artworks as framed pieces on gallery walls and open an HTML overlay when an artwork is selected.

The 3D room should come after the basic data model, 2D timeline, artist detail page, artwork overlay, and generated local data are stable.

## MVP Scope

- One simple rectangular gallery room.
- One or more walls with framed artwork images.
- Basic camera controls.
- Clickable artworks.
- HTML artwork overlay outside the canvas.
- Normalized artwork data passed into the scene through props.
- Local/generated artwork image URLs from free Wikimedia sources.

## Out Of Scope For MVP

- Complex physics.
- Multiplayer.
- Realistic walking simulation.
- Heavy GLTF museum models.
- Advanced post-processing.
- Runtime fetching from Wikipedia, Wikimedia Commons, or Wikidata inside the 3D scene.
- Full museum-scale navigation.

## Suggested User Flow

1. User opens an artist detail page.
2. User clicks `Enter exhibition room`.
3. The app loads a 3D room route for that artist.
4. Artworks appear as framed images on the walls.
5. User clicks an artwork frame.
6. The selected artwork opens in an HTML overlay with title, year, description, image credit, and source link.

## Data Requirements

The 3D room should receive an artist and artworks from normalized local data.

Required artist fields:

- `id`
- `slug`
- `name`
- `sourceUrl`

Required artwork fields:

- `id`
- `artistId`
- `title`
- `year`
- `description`
- `imageUrl`
- `thumbnailUrl`
- `sourceUrl`
- `license`
- `credit`
- `dimensions`

The scene should still render if an artwork has no image. Use a neutral placeholder frame with the artwork title.

## Free Wikipedia/Wikimedia Data Plan

Use Wikimedia Commons for artwork images whenever available because many public-domain artwork files live there.

Preferred flow:

1. Keep a curated local list of artworks per artist.
2. Include known Wikimedia Commons file titles when possible, for example `File:Mona Lisa, by Leonardo da Vinci, from C2RMF retouched.jpg`.
3. Run a local Node/TypeScript script to fetch Commons metadata.
4. Normalize image URLs, license, credit, and source page URLs.
5. Save generated JSON locally.
6. The SvelteKit and Threlte code consumes only normalized local JSON.

Do not load raw Wikimedia API responses directly into Threlte components.

## Free APIs To Use

Wikimedia Commons file metadata through MediaWiki Action API:

```txt
https://commons.wikimedia.org/w/api.php?action=query&titles={fileTitle}&prop=imageinfo&iiprop=url|extmetadata|mime|size&iiurlwidth=1200&format=json&origin=*
```

Use it for:

- Artwork image URL.
- Thumbnail URL.
- License name and URL.
- Artist/author credit when available.
- Wikimedia Commons source page.
- Image dimensions.

Wikipedia REST summary endpoint for artwork summaries when a dedicated artwork page exists:

```txt
https://en.wikipedia.org/api/rest_v1/page/summary/{artworkPageTitle}
```

Use it for:

- Short artwork descriptions.
- Wikipedia source URLs.
- Fallback thumbnails.

Wikidata can be considered later for structured artwork metadata:

```txt
https://www.wikidata.org/w/api.php?action=wbgetentities&ids={wikidataEntityId}&props=claims|labels|descriptions|sitelinks&languages=en&format=json&origin=*
```

Use Wikidata only when curated entity IDs are available or matching has been reviewed.

## Data Fetching Rules

- Use free public Wikimedia APIs.
- Do not scrape HTML.
- Do not use paid APIs.
- Fetch/enrich data from local scripts only.
- Store generated JSON in the repository or in a documented generated-data folder.
- Store `sourceUrl` for every artwork when available.
- Store image credit and license when available.
- Handle missing images, licenses, dates, and dimensions.
- Use thumbnails or resized image URLs for the 3D room instead of unnecessarily large originals.

## 3D Scene Guidelines

- Keep the scene isolated from regular UI code.
- Pass normalized data into the scene through props.
- Keep artwork selection state in Svelte UI code, not in remote data calls.
- Render artwork images on planes.
- Add simple frame geometry around each image.
- Use consistent spacing between frames.
- Keep lighting simple and performant.
- Prefer a small number of artworks per wall for MVP readability.
- Use an HTML overlay for artwork details instead of embedding large text in 3D.

## Suggested Components Later

- `src/lib/components/exhibition/ExhibitionScene.svelte`
- `src/lib/components/exhibition/Room.svelte`
- `src/lib/components/exhibition/GalleryWall.svelte`
- `src/lib/components/exhibition/ArtworkFrame.svelte`
- `src/lib/components/exhibition/CameraControls.svelte`
- `src/lib/components/artworks/ArtworkOverlay.svelte`

## Suggested Files Later

- `src/lib/data/seed/artworks.ts`
- `src/lib/data/generated/artworks.json`
- `src/lib/types/domain.ts`
- `src/lib/data/normalizeArtwork.ts`
- `scripts/enrich-artworks.ts`
- `src/routes/artists/[slug]/room/+page.svelte`

## Acceptance Criteria

- Artist room renders from normalized local data.
- Artworks appear as framed images or placeholder frames.
- Clicking an artwork opens an HTML overlay.
- The scene does not fetch remote data.
- Image source, license, and credit are shown in the overlay when available.
- The room remains simple and performant for MVP.
