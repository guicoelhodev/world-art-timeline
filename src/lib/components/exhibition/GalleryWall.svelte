<script lang="ts">
	import { T } from '@threlte/core';
	import type { Artwork } from '$lib/types/domain';
	import ArtworkFrame from './ArtworkFrame.svelte';

	let {
		artworks,
		position,
		rotation,
		onSelect
	}: {
		artworks: Artwork[];
		position: [number, number, number];
		rotation: [number, number, number];
		onSelect: (artwork: Artwork) => void;
	} = $props();

	const spacing = 1.65;
</script>

<T.Group {position} {rotation}>
	{#each artworks as artwork, index (artwork.id)}
		<ArtworkFrame
			{artwork}
			position={[(index - (artworks.length - 1) / 2) * spacing, 0, 0.04]}
			{onSelect}
		/>
	{/each}
</T.Group>
