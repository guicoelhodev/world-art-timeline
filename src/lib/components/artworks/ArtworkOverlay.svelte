<script lang="ts">
	import type { Artwork, SupportedLanguage } from '$lib/types/domain';

	let {
		artwork,
		language,
		onClose
	}: { artwork: Artwork; language: SupportedLanguage; onClose: () => void } = $props();

	const localized = (value: Partial<Record<SupportedLanguage, string>>) =>
		value[language] ?? value.en ?? value.pt ?? '';
	let sourceUrl = $derived(
		artwork.sourceUrl[language] ?? artwork.sourceUrl.en ?? artwork.wikidataUrl
	);
</script>

<div
	class="fixed inset-0 z-50 flex items-end justify-center bg-black/65 p-4 backdrop-blur-sm md:items-center"
	role="dialog"
	aria-modal="true"
>
	<article
		class="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-3xl border border-stone-700 bg-stone-950 text-stone-100 shadow-2xl"
	>
		<div class="grid gap-0 md:grid-cols-[0.9fr_1.1fr]">
			<div class="bg-stone-900">
				{#if artwork.image}
					<img
						class="h-full min-h-72 w-full object-cover"
						src={artwork.image.thumbnailUrl}
						alt={localized(artwork.title)}
					/>
				{:else}
					<div class="flex min-h-72 items-center justify-center p-8 text-center text-stone-400">
						No image available
					</div>
				{/if}
			</div>

			<div class="p-6 md:p-8">
				<div class="flex items-start justify-between gap-4">
					<div>
						<p class="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">Artwork</p>
						<h2 class="mt-2 text-2xl font-semibold text-stone-50">{localized(artwork.title)}</h2>
					</div>
					<button
						class="rounded-full border border-stone-600 px-3 py-1 text-sm text-stone-300 hover:border-amber-300 hover:text-amber-200"
						type="button"
						onclick={onClose}>Close</button
					>
				</div>

				{#if artwork.year}
					<p class="mt-3 text-sm text-stone-400">{artwork.year}</p>
				{/if}

				<p class="mt-5 leading-7 text-stone-300">
					{localized(artwork.description) || 'No description available from the public APIs.'}
				</p>

				<dl class="mt-6 space-y-3 text-sm text-stone-300">
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
					class="mt-7 inline-flex rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 hover:bg-amber-200"
					href={sourceUrl}
					target="_blank"
					rel="external noreferrer">Open source page</a
				>
			</div>
		</div>
	</article>
</div>
