<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { interactivity } from '@threlte/extras';
	import { Camera, Object3D, Raycaster, Vector2 } from 'three';
	import type { Artist, Artwork } from '$lib/types/domain';
	import ArtworkFrame from './ArtworkFrame.svelte';
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
	let featuredArtwork = $derived(artworks[0]);
	let remainingArtworks = $derived(artworks.slice(1));
	let frontWallCount = $derived(Math.max(0, Math.ceil(remainingArtworks.length / 3) - 2));
	let sideWallArtworks = $derived(remainingArtworks.slice(frontWallCount));
	let frontWall = $derived(remainingArtworks.slice(0, frontWallCount));
	let rightWall = $derived(sideWallArtworks.filter((_, index) => index % 2 === 0));
	let leftWall = $derived(sideWallArtworks.filter((_, index) => index % 2 === 1));
	let focusedArtworkId = $state<string | null>(null);

	const { camera, scene } = useThrelte();
	const raycaster = new Raycaster();
	const focusDistance = 8;
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

		raycaster.near = 0;
		raycaster.far = focusDistance;
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
<T.PointLight position={[0, 2.8, -10]} intensity={7} distance={12} color="#fff8ec" />
<T.PointLight position={[0, 2.8, 10]} intensity={7} distance={12} color="#fff8ec" />

<T.Group name={artist.id}>
	<Room />
	{#if featuredArtwork}
		<T.Group position={[0, 2.75, -14.92]} rotation={[0, 0, 0]}>
			<ArtworkFrame
				artwork={featuredArtwork}
				position={[0, 0, 0.04]}
				focused={focusedArtworkId === featuredArtwork.id}
				maxWidth={11.2}
				maxHeight={3.3}
				{onSelect}
			/>
		</T.Group>
	{/if}
	<GalleryWall
		artworks={frontWall}
		position={[0, 2.75, 14.92]}
		rotation={[0, Math.PI, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={rightWall}
		position={[6.92, 2.75, 0]}
		rotation={[0, -Math.PI / 2, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={leftWall}
		position={[-6.92, 2.75, 0]}
		rotation={[0, Math.PI / 2, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
</T.Group>
