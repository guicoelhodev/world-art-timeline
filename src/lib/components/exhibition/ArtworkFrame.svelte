<script lang="ts">
	import { T } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { DoubleSide } from 'three';
	import type { Artwork } from '$lib/types/domain';

	let {
		artwork,
		position,
		focused,
		maxWidth = 2.08,
		maxHeight = 2.72,
		onSelect
	}: {
		artwork: Artwork;
		position: [number, number, number];
		focused: boolean;
		maxWidth?: number;
		maxHeight?: number;
		onSelect?: (artwork: Artwork) => void;
	} = $props();

	let hover = $state(false);
	let active = $derived(hover || focused);
	let title = $derived(artwork.title.en ?? artwork.title.pt ?? artwork.id);
	let imageUrl = $derived(artwork.image?.url ?? artwork.image?.thumbnailUrl);
	let imageSize = $derived.by(() =>
		fitImage(artwork.dimensions?.width, artwork.dimensions?.height)
	);
	let frameSize = $derived<[number, number]>([imageSize[0] + 0.32, imageSize[1] + 0.38]);
	let surfacePixels = $derived<[number, number]>([
		Math.round(imageSize[0] * 200),
		Math.round(imageSize[1] * 200)
	]);
	let fallbackFontSize = $derived(`${Math.max(18, Math.round(surfacePixels[0] / 8))}px`);
	const landscapeAspectRatio = 1.15;
	const landscapeWidthMultiplier = 1.5;

	function fitImage(width = 1, height = 1): [number, number] {
		const aspect = width > 0 && height > 0 ? width / height : 1;
		let fittedWidth =
			aspect > landscapeAspectRatio ? maxWidth * landscapeWidthMultiplier : maxWidth;
		let fittedHeight = fittedWidth / aspect;

		if (fittedHeight > maxHeight) {
			fittedHeight = maxHeight;
			fittedWidth = fittedHeight * aspect;
		}

		return [fittedWidth, fittedHeight];
	}
</script>

<T.Group
	{position}
	userData={{ artworkId: artwork.id }}
	onclick={(e: { stopPropagation: () => void }) => {
		e.stopPropagation();
		onSelect?.(artwork);
	}}
	onpointerenter={() => (hover = true)}
	onpointerleave={() => (hover = false)}
>
	<T.Mesh position={[0, 0, -0.035]}>
		<T.BoxGeometry args={[frameSize[0], frameSize[1], 0.08]} />
		<T.MeshStandardMaterial color={active ? '#c58b2d' : '#2b2118'} roughness={0.65} />
	</T.Mesh>

	<T.Mesh position={[0, 0, 0.03]} userData={{ artworkId: artwork.id }}>
		<T.PlaneGeometry args={imageSize} />
		<T.MeshBasicMaterial transparent opacity={0} side={DoubleSide} />
	</T.Mesh>

	<HTML position={[0, 0, 0.04]} scale={0.2} transform pointerEvents="none">
		<div
			class:active
			class="artwork-surface"
			style:width={`${surfacePixels[0]}px`}
			style:height={`${surfacePixels[1]}px`}
			aria-label={title}
		>
			{#if imageUrl}
				<img src={imageUrl} alt={title} loading="eager" decoding="async" />
			{:else}
				<div class="artwork-fallback" style:font-size={fallbackFontSize}>{title}</div>
			{/if}
		</div>
	</HTML>
</T.Group>

<style>
	.artwork-surface {
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
