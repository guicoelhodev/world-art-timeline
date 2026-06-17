<script lang="ts">
	import { T } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import type { Artist, Artwork } from '$lib/types/domain';
	import CameraControls from './CameraControls.svelte';
	import GalleryWall from './GalleryWall.svelte';
	import Room from './Room.svelte';

	interactivity();

	let {
		artist,
		artworks,
		onSelect
	}: { artist: Artist; artworks: Artwork[]; onSelect: (artwork: Artwork) => void } = $props();
	let leftWall = $derived(artworks.filter((_, index) => index % 2 === 0));
	let rightWall = $derived(artworks.filter((_, index) => index % 2 === 1));
</script>

<CameraControls />
<T.AmbientLight intensity={0.7} />
<T.DirectionalLight position={[2, 5, 4]} intensity={1.8} />
<T.PointLight position={[0, 2.6, 0]} intensity={14} distance={9} color="#fff5df" />

<T.Group name={artist.id}>
	<Room />
	<GalleryWall artworks={leftWall} position={[0, 1.45, -3.92]} rotation={[0, 0, 0]} {onSelect} />
	<GalleryWall
		artworks={rightWall}
		position={[3.92, 1.45, 0]}
		rotation={[0, -Math.PI / 2, 0]}
		{onSelect}
	/>
</T.Group>
