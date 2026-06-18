<script lang="ts">
	import { Canvas } from '@threlte/core';
	import SceneStage from './SceneStage.svelte';
	import type { Artist, Artwork } from '$lib/types/domain';

	let {
		artist,
		artworks,
		overlayOpen,
		onSelect
	}: {
		artist: Artist;
		artworks: Artwork[];
		overlayOpen: boolean;
		onSelect: (artwork: Artwork) => void;
	} = $props();
</script>

<div class="relative h-dvh w-screen touch-none" data-room-canvas tabindex="-1">
	<Canvas>
		<SceneStage {artist} {artworks} {overlayOpen} {onSelect} />
	</Canvas>
</div>
