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
		onSelect
	}: {
		artist: Artist;
		artworks: Artwork[];
		onSelect?: (artwork: Artwork | null) => void;
	} = $props();
	let featuredArtwork = $derived(artworks[0]);
	let frontWall = $derived(artworks.slice(1, 4));
	let rightWall = $derived(artworks.slice(4, 12));
	let leftWall = $derived(artworks.slice(12, 20));
	let focusedArtworkId = $state<string | null>(null);
	let selectedArtworkId = $state<string | null>(null);

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

		if (!(camera.current instanceof Camera)) return;

		raycaster.setFromCamera(center, camera.current);
		const hit = raycaster
			.intersectObjects(scene.children, true)
			.find((intersection) => artworkIdFromObject(intersection.object));

		const id = hit ? artworkIdFromObject(hit.object) : null;
		selectedArtworkId = id;
		onSelect?.(id ? (artworkById.get(id) ?? null) : null);
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

		if (selectedArtworkId && focusedArtworkId !== selectedArtworkId) {
			selectedArtworkId = null;
			onSelect?.(null);
		}
	});
</script>

<svelte:window onclick={handleClick} />

<CameraControls />
<T.AmbientLight intensity={0.7} />
<T.HemisphereLight args={['#fff8ec', '#b8a37f', 1.1]} />
<T.PointLight position={[0, 4.5, 0]} intensity={16} distance={13} color="#fff5df" />
<T.PointLight position={[0, 3, -10]} intensity={7} distance={12} color="#fff8ec" />
<T.PointLight position={[0, 3, 10]} intensity={7} distance={12} color="#fff8ec" />

<T.Group name={artist.id}>
	<Room />
	{#if featuredArtwork}
		<T.Group position={[0, 3, -14.92]} rotation={[0, 0, 0]}>
			<ArtworkFrame
				artwork={featuredArtwork}
				position={[0, 0, 0.04]}
				focused={focusedArtworkId === featuredArtwork.id}
				maxWidth={8}
				maxHeight={3.6}
				{onSelect}
			/>
		</T.Group>
	{/if}
	<GalleryWall
		artworks={frontWall}
		position={[0, 3, 14.92]}
		rotation={[0, Math.PI, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={rightWall}
		position={[5.92, 3, 0]}
		rotation={[0, -Math.PI / 2, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
	<GalleryWall
		artworks={leftWall}
		position={[-5.92, 3, 0]}
		rotation={[0, Math.PI / 2, 0]}
		{focusedArtworkId}
		{onSelect}
	/>
</T.Group>
