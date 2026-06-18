<script lang="ts">
	import { T } from '@threlte/core';
	import type { Artwork } from '$lib/types/domain';
	import ArtworkFrame from './ArtworkFrame.svelte';

	let {
		artworks,
		position,
		rotation,
		focusedArtworkId,
		onSelect
	}: {
		artworks: Artwork[];
		position: [number, number, number];
		rotation: [number, number, number];
		focusedArtworkId: string | null;
		onSelect?: (artwork: Artwork) => void;
	} = $props();

	const gap = 0.75;
	let framePositions = $derived.by(() => {
		const widths = artworks.map(frameWidth);
		const totalWidth =
			widths.reduce((total, width) => total + width, 0) + gap * (widths.length - 1);
		let cursor = -totalWidth / 2;

		return widths.map((width) => {
			const position = cursor + width / 2;
			cursor += width + gap;
			return position;
		});
	});

	function frameWidth(artwork: Artwork) {
		const maxWidth = 2.08;
		const maxHeight = 2.72;
		const width = artwork.dimensions?.width ?? 1;
		const height = artwork.dimensions?.height ?? 1;
		const aspect = width > 0 && height > 0 ? width / height : 1;
		let fittedWidth = maxWidth;
		let fittedHeight = fittedWidth / aspect;

		if (fittedHeight > maxHeight) {
			fittedHeight = maxHeight;
			fittedWidth = fittedHeight * aspect;
		}

		return fittedWidth + 0.32;
	}
</script>

<T.Group {position} {rotation}>
	{#each artworks as artwork, index (artwork.id)}
		<ArtworkFrame
			{artwork}
			position={[framePositions[index], 0, 0.04]}
			focused={focusedArtworkId === artwork.id}
			{onSelect}
		/>
	{/each}
</T.Group>
