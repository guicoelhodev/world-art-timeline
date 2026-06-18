<script lang="ts">
	import type { Artwork, SupportedLanguage } from '$lib/types/domain';

	let {
		artwork,
		language
	}: { artwork: Artwork; language: SupportedLanguage } = $props();

	const localized = (value: Partial<Record<SupportedLanguage, string>>) =>
		value[language] ?? value.en ?? value.pt ?? '';
	let sourceUrl = $derived(
		artwork.sourceUrl[language] ?? artwork.sourceUrl.en ?? artwork.wikidataUrl
	);
</script>

<div
	class="fixed right-0 top-0 z-40 flex h-dvh w-80 flex-col border-l border-stone-700 bg-stone-950/90 shadow-xl backdrop-blur-md md:w-96"
>
	<div class="overflow-y-auto p-5">
		{#if artwork.image}
			<img
				class="mb-4 w-full rounded-lg object-cover"
				src={artwork.image.thumbnailUrl}
				alt={localized(artwork.title)}
			/>
		{/if}
		<div>
			<p class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Artwork</p>
			<h2 class="mt-2 text-xl font-semibold text-stone-50">{localized(artwork.title)}</h2>
		</div>

		{#if artwork.year}
			<p class="mt-2 text-sm text-stone-400">{artwork.year}</p>
		{/if}

		<p class="mt-4 leading-7 text-stone-300">
			{localized(artwork.description) || 'No description available from the public APIs.'}
		</p>

		<dl class="mt-5 space-y-3 text-sm text-stone-300">
			{#if artwork.license}
				<div>
					<dt class="font-medium text-stone-100">License</dt>
					<dd>{artwork.license}</dd>
				</div>
			{/if}
			{#if artwork.credit}
				<div>
					<dt class="font-medium text-stone-100">Credit</dt>
					<dd>{artwork.credit}</dd>
				</div>
			{/if}
			{#if artwork.image?.sourceUrl}
				<div>
					<dt class="font-medium text-stone-100">Image source</dt>
					<dd>
						<a
							class="text-amber-200 underline"
							href={artwork.image.sourceUrl}
							target="_blank"
							rel="external noreferrer">Wikimedia Commons</a
						>
					</dd>
				</div>
			{/if}
		</dl>

		<a
			class="mt-5 inline-flex rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-200"
			href={sourceUrl}
			target="_blank"
			rel="external noreferrer">Open source page</a
		>
	</div>
</div>