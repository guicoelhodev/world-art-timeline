<script lang="ts">
	import ArtworkOverlay from '$lib/components/artworks/ArtworkOverlay.svelte';
	import ExhibitionScene from '$lib/components/exhibition/ExhibitionScene.svelte';
	import type { Artwork } from '$lib/types/domain';

	let { data }: import('./$types').PageProps = $props();
	let selectedArtwork = $state<Artwork | null>(null);

	const localized = (value: Partial<Record<'en' | 'pt', string>>) =>
		value[data.language] ?? value.en ?? value.pt ?? '';
</script>

<svelte:head>
	<title>{localized(data.artist.name)} Exhibition Room</title>
</svelte:head>

<main class="min-h-screen bg-stone-950 text-stone-50">
	<section
		class="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 lg:px-8"
	>
		<header
			class="flex flex-col gap-4 border-b border-stone-700/70 pb-5 md:flex-row md:items-end md:justify-between"
		>
			<div class="max-w-3xl">
				<p class="text-xs font-semibold uppercase tracking-[0.32em] text-amber-300">
					3D artist room
				</p>
				<h1 class="mt-2 text-3xl font-semibold tracking-tight text-stone-50 md:text-5xl">
					{localized(data.artist.name)}
				</h1>
				<p class="mt-3 text-sm leading-6 text-stone-300 md:text-base">
					{localized(data.artist.description)}
				</p>
			</div>

			<div class="flex items-center gap-2 text-sm text-stone-300">
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
			class="relative min-h-[620px] flex-1 overflow-hidden rounded-[2rem] border border-stone-700 bg-stone-900 shadow-2xl shadow-black/40"
		>
			<ExhibitionScene
				artist={data.artist}
				artworks={data.artworks}
				onSelect={(artwork) => (selectedArtwork = artwork)}
			/>

			<div
				class="pointer-events-none absolute left-5 top-5 max-w-sm rounded-2xl border border-white/10 bg-black/45 p-4 text-sm text-stone-200 backdrop-blur"
			>
				<p class="font-medium text-stone-50">
					{data.artworks.length} artworks loaded from public APIs
				</p>
				<p class="mt-1 text-stone-300">
					Click a framed piece to open source, license and credit details.
				</p>
			</div>
		</div>
	</section>
</main>

{#if selectedArtwork}
	<ArtworkOverlay
		artwork={selectedArtwork}
		language={data.language}
		onClose={() => (selectedArtwork = null)}
	/>
{/if}
