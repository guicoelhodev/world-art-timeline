<script lang="ts">
	import { Canvas } from '@threlte/core';
	import SceneStage from './SceneStage.svelte';
	import type { Artist, Artwork } from '$lib/types/domain';

	let {
		artist,
		artworks,
		onSelect
	}: { artist: Artist; artworks: Artwork[]; onSelect: (artwork: Artwork) => void } = $props();
</script>

<div class="h-full min-h-[620px] w-full touch-none">
	<Canvas>
		<SceneStage {artist} {artworks} {onSelect} />
	</Canvas>
</div>
