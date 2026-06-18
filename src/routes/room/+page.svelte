<script lang="ts">
	import ArtworkOverlay from '$lib/components/artworks/ArtworkOverlay.svelte';
	import ExhibitionScene from '$lib/components/exhibition/ExhibitionScene.svelte';
	import type { Artwork } from '$lib/types/domain';

	let { data }: import('./$types').PageProps = $props();
	let focusedArtwork = $state<Artwork | null>(null);

	const localized = (value: Partial<Record<'en' | 'pt', string>>) =>
		value[data.language] ?? value.en ?? value.pt ?? '';
</script>

<svelte:head>
	<title>{localized(data.artist.name)} Exhibition Room</title>
</svelte:head>

<main class="fixed inset-0 h-dvh overflow-hidden bg-stone-950 text-stone-50">
	<ExhibitionScene
		artist={data.artist}
		artworks={data.artworks}
		onSelect={(artwork) => (focusedArtwork = artwork)}
	/>

	<section class="pointer-events-none absolute inset-0 flex flex-col justify-between p-4 sm:p-6">
		<header class="flex items-start justify-between gap-4">
			<div class="max-w-3xl">
				<p class="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">
					3D artist room
				</p>
				<h1
					class="mt-2 text-3xl font-semibold tracking-tight text-stone-50 drop-shadow md:text-5xl"
				>
					{localized(data.artist.name)}
				</h1>
				<p class="mt-3 max-w-xl text-sm leading-6 text-stone-200 drop-shadow md:text-base">
					{localized(data.artist.description)}
				</p>
			</div>

			<div class="pointer-events-auto flex items-center gap-2 text-sm text-stone-200">
				<form method="GET" action="/room">
					<input type="hidden" name="author" value="Michelangelo" />
					<input type="hidden" name="lang" value="en" />
					<button
						class="rounded-full border border-stone-600 px-3 py-1.5 hover:border-amber-300 hover:text-amber-200"
						type="submit">EN</button
					>
				</form>
				<form method="GET" action="/room">
					<input type="hidden" name="author" value="Michelangelo" />
					<input type="hidden" name="lang" value="pt" />
					<button
						class="rounded-full border border-stone-600 px-3 py-1.5 hover:border-amber-300 hover:text-amber-200"
						type="submit">PT</button
					>
				</form>
			</div>
		</header>

		<div
			class="max-w-sm rounded-2xl border border-white/10 bg-black/45 p-4 text-sm text-stone-200 backdrop-blur"
		>
			<p class="font-medium text-stone-50">
				{data.artworks.length} artworks loaded from public APIs
			</p>
			<p class="mt-1 text-stone-300">Click the room to lock pointer. Use WASD or arrows to walk.</p>
		</div>
	</section>

	<div
		class="pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-200/80 shadow-[0_0_16px_rgba(251,191,36,0.55)]"
	></div>
</main>

{#if focusedArtwork}
	<ArtworkOverlay artwork={focusedArtwork} language={data.language} />
{/if}