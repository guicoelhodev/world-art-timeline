<script lang="ts">
	import type { Artwork, SupportedLanguage } from '$lib/types/domain';

	let {
		artwork,
		language,
		artistName
	}: { artwork: Artwork; language: SupportedLanguage; artistName: string } = $props();

	const localized = (value: Partial<Record<SupportedLanguage, string>>) =>
		value[language] ?? value.en ?? '';

	let movement = $derived(localized(artwork.movement ?? {}));
	let medium = $derived(localized(artwork.medium ?? {}));
	let genre = $derived(localized(artwork.genre ?? {}));
	let location = $derived(localized(artwork.location ?? {}));
	let dimensions = $derived(
		artwork.dimensions?.width && artwork.dimensions?.height
			? `${artwork.dimensions.width} × ${artwork.dimensions.height} cm`
			: undefined
	);

	let description = $derived(
		artwork.extract || localized(artwork.description) || 'No description available.'
	);

	let metaLine = $derived(
		[artistName, artwork.year?.toString(), medium, genre, location].filter(Boolean).join(' · ')
	);

	function handleWheel(event: WheelEvent) {
		const target = event.currentTarget as HTMLDivElement;
		target.scrollTop += event.deltaY;
		event.preventDefault();
	}
</script>

<div
	class="fixed right-0 top-0 z-40 flex h-dvh w-96 flex-col border-l border-stone-700 bg-stone-800/80 shadow-xl backdrop-blur-md md:w-[28rem]"
>
	<div
		class="sticky top-0 z-10 border-b border-stone-700/50 bg-stone-800/90 px-5 pb-3 pt-5 backdrop-blur-md"
	>
		{#if movement}
			<span
				class="inline-block rounded-full border border-amber-500/40 px-2.5 py-0.5 text-xs font-medium uppercase tracking-[0.22em] text-amber-300"
			>
				{movement}
			</span>
		{/if}

		<h2 class="mt-2.5 text-2xl font-semibold leading-tight text-stone-50">
			{localized(artwork.title)}
		</h2>

		{#if metaLine}
			<p class="mt-1.5 text-sm leading-relaxed text-stone-400">{metaLine}</p>
		{/if}
	</div>

	<div onwheel={handleWheel} class="flex-1 overflow-y-auto px-5">
		<div class="mt-4 leading-7 text-stone-200">{description}</div>

		<dl class="mt-5 space-y-3 pb-5 text-sm text-stone-300">
			{#if dimensions}
				<div>
					<dt class="font-medium text-stone-100">Dimensions</dt>
					<dd>{dimensions}</dd>
				</div>
			{/if}
			{#if artwork.license}
				<div>
					<dt class="font-medium text-stone-100">License</dt>
					<dd>{artwork.license}</dd>
				</div>
			{/if}
			{#if artwork.credit}
				<div>
					<dt class="font-medium text-stone-100">Credit</dt>
					<dd class="break-words">{artwork.credit}</dd>
				</div>
			{/if}
		</dl>
	</div>
</div>
