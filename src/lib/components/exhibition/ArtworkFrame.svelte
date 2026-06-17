<script lang="ts">
	import { T } from '@threlte/core';
	import { CanvasTexture, SRGBColorSpace, Texture, TextureLoader } from 'three';
	import type { Artwork } from '$lib/types/domain';

	let {
		artwork,
		position,
		onSelect
	}: {
		artwork: Artwork;
		position: [number, number, number];
		onSelect: (artwork: Artwork) => void;
	} = $props();

	let texture = $state<Texture | null>(null);
	let hover = $state(false);
	let title = $derived(artwork.title.en ?? artwork.title.pt ?? artwork.id);

	$effect(() => {
		const source = artwork.image?.thumbnailUrl ?? artwork.image?.url;
		let cancelled = false;

		if (!source) {
			texture = createTitleTexture(title);
			return;
		}

		new TextureLoader().load(
			source,
			(loadedTexture) => {
				if (cancelled) return;
				loadedTexture.colorSpace = SRGBColorSpace;
				texture = loadedTexture;
			},
			undefined,
			() => {
				if (!cancelled) texture = createTitleTexture(title);
			}
		);

		return () => {
			cancelled = true;
		};
	});

	function createTitleTexture(value: string) {
		const canvas = document.createElement('canvas');
		canvas.width = 512;
		canvas.height = 640;
		const context = canvas.getContext('2d');

		if (context) {
			context.fillStyle = '#d8d0c3';
			context.fillRect(0, 0, canvas.width, canvas.height);
			context.fillStyle = '#3b3328';
			context.font = 'bold 36px serif';
			context.textAlign = 'center';
			wrapText(context, value, canvas.width / 2, 280, 400, 44);
		}

		const canvasTexture = new CanvasTexture(canvas);
		canvasTexture.colorSpace = SRGBColorSpace;
		return canvasTexture;
	}

	function wrapText(
		context: CanvasRenderingContext2D,
		value: string,
		x: number,
		y: number,
		maxWidth: number,
		lineHeight: number
	) {
		const words = value.split(' ');
		let line = '';

		for (const word of words) {
			const testLine = `${line}${word} `;
			if (context.measureText(testLine).width > maxWidth && line) {
				context.fillText(line, x, y);
				line = `${word} `;
				y += lineHeight;
			} else {
				line = testLine;
			}
		}

		context.fillText(line, x, y);
	}
</script>

<T.Group
	{position}
	scale={hover ? 1.06 : 1}
	onclick={(event: { stopPropagation: () => void }) => {
		event.stopPropagation();
		onSelect(artwork);
	}}
	onpointerenter={() => (hover = true)}
	onpointerleave={() => (hover = false)}
>
	<T.Mesh position={[0, 0, -0.035]}>
		<T.BoxGeometry args={[1.2, 1.55, 0.06]} />
		<T.MeshStandardMaterial color={hover ? '#c58b2d' : '#2b2118'} roughness={0.65} />
	</T.Mesh>

	<T.Mesh position={[0, 0, 0]}>
		<T.PlaneGeometry args={[1, 1.32]} />
		{#if texture}
			<T.MeshBasicMaterial map={texture} toneMapped={false} />
		{:else}
			<T.MeshStandardMaterial color="#cfc6b8" />
		{/if}
	</T.Mesh>
</T.Group>
