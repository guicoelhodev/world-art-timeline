<script lang="ts">
	import { T } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { DoubleSide } from 'three';
	import type { Artwork } from '$lib/types/domain';

	let {
		artwork,
		position,
		focused,
		onSelect
	}: {
		artwork: Artwork;
		position: [number, number, number];
		focused: boolean;
		onSelect: (artwork: Artwork) => void;
	} = $props();

	let hover = $state(false);
	let active = $derived(hover || focused);
	let title = $derived(artwork.title.en ?? artwork.title.pt ?? artwork.id);
	let imageUrl = $derived(artwork.image?.url ?? artwork.image?.thumbnailUrl);
</script>

<T.Group
	{position}
	scale={active ? 1.06 : 1}
	userData={{ artworkId: artwork.id }}
	onclick={(event: { stopPropagation: () => void }) => {
		event.stopPropagation();
		onSelect(artwork);
	}}
	onpointerenter={() => (hover = true)}
	onpointerleave={() => (hover = false)}
>
	<T.Mesh position={[0, 0, -0.035]}>
		<T.BoxGeometry args={[2.4, 3.1, 0.08]} />
		<T.MeshStandardMaterial color={active ? '#c58b2d' : '#2b2118'} roughness={0.65} />
	</T.Mesh>

	<T.Mesh position={[0, 0, 0.03]} userData={{ artworkId: artwork.id }}>
		<T.PlaneGeometry args={[2.08, 2.72]} />
		<T.MeshBasicMaterial transparent opacity={0} side={DoubleSide} />
	</T.Mesh>

	<HTML position={[0, 0, 0.04]} scale={0.2} transform pointerEvents="none">
		<div class:active class="artwork-surface" aria-label={title}>
			{#if imageUrl}
				<img src={imageUrl} alt={title} loading="eager" decoding="async" />
			{:else}
				<div class="artwork-fallback">{title}</div>
			{/if}
		</div>
	</HTML>
</T.Group>

<style>
	.artwork-surface {
		width: 420px;
		height: 540px;
		overflow: hidden;
		background: #d8d0c3;
		box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.18);
		transition:
			filter 120ms ease,
			transform 120ms ease;
	}

	.artwork-surface.active {
		filter: saturate(1.18) brightness(1.1);
	}

	.artwork-surface img {
		width: 100%;
		height: 100%;
		display: block;
		object-fit: contain;
	}

	.artwork-fallback {
		display: grid;
		width: 100%;
		height: 100%;
		place-items: center;
		padding: 12px;
		text-align: center;
		font-family: Georgia, serif;
		font-size: 50px;
		font-weight: 700;
		color: #3b3328;
	}
</style>
