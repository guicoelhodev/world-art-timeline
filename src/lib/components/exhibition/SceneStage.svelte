<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { Camera, Object3D, Raycaster, Vector2 } from 'three';
	import type { Artist, Artwork } from '$lib/types/domain';
	import CameraControls from './CameraControls.svelte';
	import GalleryWall from './GalleryWall.svelte';
	import Room from './Room.svelte';

	interactivity();

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
	let backWall = $derived(artworks.filter((_, index) => index % 4 === 0));
	let frontWall = $derived(artworks.filter((_, index) => index % 4 === 1));
	let rightWall = $derived(artworks.filter((_, index) => index % 4 === 2));
	let leftWall = $derived(artworks.filter((_, index) => index % 4 === 3));
	let focusedArtworkId = $state<string | null>(null);

	const { camera, scene } = useThrelte();
	const raycaster = new Raycaster();
	const center = new Vector2(0, 0);
	const artworkById = $derived(new Map(artworks.map((artwork) => [artwork.id, artwork])));

	function artworkIdFromObject(object: Object3D): string | null {
		let current: Object3D | null = object;

		while (current) {
			const artworkId = current.userData.artworkId;
			if (typeof artworkId === 'string') return artworkId;
			current = current.parent;
		}

		return null;
	}

	function handleClick(event: MouseEvent) {
		const target = event.target;
		if (target instanceof HTMLElement && target.closest('button, a, input')) return;
		if (overlayOpen) return;
		if (!focusedArtworkId) return;
		const artwork = artworkById.get(focusedArtworkId);
		if (artwork) onSelect(artwork);
	}

	useTask(() => {
		if (!(camera.current instanceof Camera)) return;

		raycaster.setFromCamera(center, camera.current);
		const hit = raycaster
			.intersectObjects(scene.children, true)
			.find((intersection) => artworkIdFromObject(intersection.object));

		focusedArtworkId = hit ? artworkIdFromObject(hit.object) : null;
	});
</script>

<svelte:window onclick={handleClick} />

<CameraControls {overlayOpen} />
<T.AmbientLight intensity={0.7} />
<T.HemisphereLight args={['#fff8ec', '#b8a37f', 1.1]} />
<T.PointLight position={[0, 3.8, 0]} intensity={16} distance={13} color="#fff5df" />
<T.PointLight position={[0, 2.8, -4.6]} intensity={7} distance={8} color="#fff8ec" />
<T.PointLight position={[0, 2.8, 4.6]} intensity={7} distance={8} color="#fff8ec" />

<T.Group name={artist.id}>
	<Room />
	<GalleryWall
		artworks={backWall}
		position={[0, 2.25, -6.92]}
		rotation={[0, 0, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={frontWall}
		position={[0, 2.25, 6.92]}
		rotation={[0, Math.PI, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={rightWall}
		position={[6.92, 2.25, 0]}
		rotation={[0, -Math.PI / 2, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={leftWall}
		position={[-6.92, 2.25, 0]}
		rotation={[0, Math.PI / 2, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
</T.Group>
