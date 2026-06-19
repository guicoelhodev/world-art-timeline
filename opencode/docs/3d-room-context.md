# 3D Room — Context for Agents

## Route

`/room?author=Michelangelo&lang=en|pt`

## Data Flow

```
+page.server.ts (load)
  └─ artist-room.ts::loadArtistRoom(author, lang)
       ├─ resolveArtistId → Wikidata wbsearchentities
       ├─ fetchArtist → Wikidata entity data
       └─ fetchArtworks → SPARQL query (visual artworks) + Wikipedia extracts
                          + Wikimedia Commons images (parallel)
                          → ArtistRoom { artist, artworks, language }
       │
       ▼
+page.svelte receives data via PageProps
  ├─ ExhibitionScene (Threlte Canvas wrapper)
  │   └─ SceneStage (walls, frames, lights, raycast, click handling)
  │       ├─ Room (floor, ceiling, 4 walls)
  │       ├─ ArtworkFrame (featured, back wall, 80% of wall size)
  │       ├─ GalleryWall x3 (front, right, left walls)
  │       │   └─ ArtworkFrame (per artwork)
  │       ├─ CameraControls (first-person, pointer lock, WASD)
  │       └─ svelte:window onclick → handleClick → onSelect callback
  │
  └─ ArtworkOverlay (right-side panel, opens on click, closes on raycast loss)
```

## Component Tree & Responsibilities

| Component         | File           | Role                                                                |
| ----------------- | -------------- | ------------------------------------------------------------------- |
| `+page.svelte`    | `routes/room/` | Layout, lang switcher, HUD, orchestrates selected artwork           |
| `ExhibitionScene` | `exhibition/`  | `<Canvas>` wrapper, passes `onSelect` down                          |
| `SceneStage`      | `exhibition/`  | Raycast (visual focus), click handler, artwork distribution, lights |
| `CameraControls`  | `exhibition/`  | First-person WASD, pointer lock, mouse look                         |
| `Room`            | `exhibition/`  | Floor + ceiling + 4 wall planes                                     |
| `GalleryWall`     | `exhibition/`  | Distributes frames horizontally along a wall                        |
| `ArtworkFrame`    | `exhibition/`  | Single frame: box border + HTML image + invisible raycast surface   |
| `ArtworkOverlay`  | `artworks/`    | Right-side panel, sticky header, scrollable description             |

## Room Geometry

| Element    | Position             | Size      | Color     |
| ---------- | -------------------- | --------- | --------- |
| Floor      | `(0,0,0)` rot `-π/2` | `14 × 30` | `#9e9990` |
| Ceiling    | `(0,6,0)` rot `π/2`  | `14 × 30` | `#d6d1c6` |
| Back wall  | `(0,3,-15)`          | `14 × 6`  | `#d6d1c6` |
| Front wall | `(0,3,15)` rot `π`   | `14 × 6`  | `#d6d1c6` |
| Left wall  | `(-6,3,0)` rot `π/2` | `30 × 6`  | `#d6d1c6` |
| Right wall | `(6,3,0)` rot `-π/2` | `30 × 6`  | `#d6d1c6` |

Camera starts at `(0, 1.6, 0)` — center of room, eye level.

## Artwork Distribution (SceneStage)

```
featuredArtwork   = artworks[0]                    → back wall, solo, 80% of wall (max 11.2×4.8)
remainingArtworks = artworks.slice(1)              → 15 artworks

frontWallCount    = ceil(remaining/3) - 2          → 3 artworks
sideWallArtworks  = remaining.slice(frontWallCount) → 12 artworks
frontWall         = remaining.slice(0, frontWallCount)
rightWall         = sideWallArtworks[i % 2 === 0]  → 6 artworks
leftWall          = sideWallArtworks[i % 2 === 1]  → 6 artworks
```

Wall positions for GalleryWall groups:

- Back (featured): `(0, 3, -14.92)` — offset 0.08 from wall at z=-15
- Front: `(0, 3, 14.92)` rot `(0, π, 0)`
- Right: `(5.92, 3, 0)` rot `(0, -π/2, 0)`
- Left: `(-5.92, 3, 0)` rot `(0, π/2, 0)`

## Interaction Flow

1. **Raycast** runs every frame (`useTask`), sets `focusedArtworkId` (for visual highlight only)
   - `Raycaster.far = 8`, center of screen `(0,0)`
2. **Hover** on frame: dark brown `#2b2118` → gold `#c58b2d`, scale 1.0 → 1.06
3. **Click** on frame: `selectedArtworkId` = id, calls `onSelect(artwork)` → opens ArtworkOverlay
4. **Auto-close**: when raycast `focusedArtworkId !== selectedArtworkId`, calls `onSelect(null)` → closes overlay
5. **Scroll**: global `wheel` listener redirects `deltaY` to panel's `scrollTop`

## ArtworkFrame Details

| Element       | Local pos      | Geometry                                                     |
| ------------- | -------------- | ------------------------------------------------------------ |
| Frame box     | `(0,0,-0.035)` | `BoxGeometry(frameSize[0]+0.32, frameSize[1]+0.38, 0.08)`    |
| Raycast plane | `(0,0,0.03)`   | `PlaneGeometry(imageSize)`, transparent, `DoubleSide`        |
| HTML image    | `(0,0,0.04)`   | `<HTML>` with `scale=0.2`, `surfacePixels = imageSize × 200` |

`fitImage()` preserves aspect ratio within `maxWidth`/`maxHeight`.
Featured: `maxWidth=11.2, maxHeight=4.8`. Regular: `maxWidth=2.08, maxHeight=2.72`.

## Camera Controls

- **Pointer lock**: click canvas → `requestPointerLock()`
- **WASD / arrows**: `speed = 5` units/sec, clamped to `x ∈ [-5.8, 5.8]`, `z ∈ [-14.15, 14.35]`, `y = 1.6`
- **Mouse look**: sensitivity `0.0022`, pitch clamped `[-0.95, 0.95]`
- **No overlayOpen guard** — controls always active (since overlay is a side panel, not modal)

## Lighting

| Light              | Position                        | Intensity | Distance | Color     |
| ------------------ | ------------------------------- | --------- | -------- | --------- |
| Ambient            | —                               | 0.7       | —        | —         |
| Hemisphere         | sky `#fff8ec`, ground `#b8a37f` | 1.1       | —        | —         |
| Point (center)     | `(0, 4.5, 0)`                   | 16        | 13       | `#fff5df` |
| Point (near back)  | `(0, 3, -10)`                   | 7         | 12       | `#fff8ec` |
| Point (near front) | `(0, 3, 10)`                    | 7         | 12       | `#fff8ec` |

## Server-side Data (`artist-room.ts`)

**Endpoints called (all free/public):**

- `wikidata.org/w/api.php?action=wbsearchentities` — resolve author name to QID
- `wikidata.org/wiki/Special:EntityData/{QID}.json` — artist entity (labels, sitelinks)
- `query.wikidata.org/sparql` — SPARQL for visual artworks, sorted by sitelinks DESC, filtered to P31:P279\* Q838948 (work of art), requires P18 (image)
- `commons.wikimedia.org/w/api.php` — image metadata (thumb, license, credit, dimensions), `iiurlwidth=2000`
- `{lang}.wikipedia.org/w/api.php?prop=extracts&exintro` — intro paragraph for each artwork with Wikipedia article

**SPARQL selects:** P571 (inception/year), P31 (artwork type), P135 (movement), P186 (material), P136 (genre), P276 (location) — all OPTIONAL, SAMPLED

**After SPARQL:** 16 Commons image fetches + 16 Wikipedia extracts → all in `Promise.all`, not serial. Filters artworks without images. Slices to 16 max.

## Domain Types (`domain.ts`)

```ts
Artwork {
  id, artistId, title: LocalizedString, year?, description: LocalizedString,
  extract?, movement?: LocalizedString, medium?: LocalizedString,
  artworkType?: LocalizedString, genre?: LocalizedString, location?: LocalizedString,
  image?: ImageMetadata, sourceUrl, wikidataUrl, license?, credit?,
  dimensions?: { width?, height? }
}
ImageMetadata { url, thumbnailUrl, width?, height?, mime?, license?, licenseUrl?, credit?, sourceUrl }
Artist { id, slug, name: LocalizedString, description, sourceUrl, wikidataUrl, image? }
SupportedLanguage = 'en' | 'pt'
LocalizedString = Partial<Record<'en' | 'pt', string>>
```

## ArtworkOverlay Panel

- Width: `w-96` (384px) / `md:w-[28rem]` (448px)
- BG: `bg-stone-800/80 backdrop-blur-md`
- Sticky header: movement pill (amber), title, meta line (`artist · year · medium · genre · location`)
- Scrollable body: Wikipedia extract (or Wikidata description), dimensions, license, credit
- No image, no links (no pointer lock mouse control for them)

## Key Files

| File                                                   | Purpose                               |
| ------------------------------------------------------ | ------------------------------------- |
| `src/routes/room/+page.server.ts`                      | Load function, calls `loadArtistRoom` |
| `src/routes/room/+page.svelte`                         | Page layout, HUD, overlay state       |
| `src/lib/server/artist-room.ts`                        | All data fetching + normalization     |
| `src/lib/types/domain.ts`                              | All TypeScript types                  |
| `src/lib/components/exhibition/SceneStage.svelte`      | Scene orchestration, raycast, click   |
| `src/lib/components/exhibition/Room.svelte`            | Floor, ceiling, 4 walls               |
| `src/lib/components/exhibition/CameraControls.svelte`  | FPS controls                          |
| `src/lib/components/exhibition/GalleryWall.svelte`     | Wall layout distribution              |
| `src/lib/components/exhibition/ArtworkFrame.svelte`    | Single framed artwork                 |
| `src/lib/components/exhibition/ExhibitionScene.svelte` | Canvas wrapper                        |
| `src/lib/components/artworks/ArtworkOverlay.svelte`    | Side panel with artwork info          |

## Constraints to Preserve

- Canvas is fullscreen (`h-dvh w-screen`), fixed overlay HUD on top
- `vite.config.ts` forces Svelte 5 runes mode
- No database, no auth, no custom backend
- All data from free public APIs (Wikidata, Wikipedia, Wikimedia Commons)
- Fetch runs server-side in `+page.server.ts` — no client-side API calls
- Artwork images rendered via `<HTML>` from `@threlte/extras`, not WebGL textures
- Pointer lock is never released by the app (only by user clicking outside canvas or panel)
- Prettier: tabs, single quotes, printWidth 100
