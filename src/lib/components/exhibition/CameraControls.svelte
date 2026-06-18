<script lang="ts">
	import { T, useTask, useThrelte } from '@threlte/core';
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { Euler, MathUtils, PerspectiveCamera, Vector3 } from 'three';

	const { dom } = useThrelte();
	const pressed = new SvelteSet<string>();
	const euler = new Euler(0, 0, 0, 'YXZ');
	const forward = new Vector3();
	const right = new Vector3();
	const movement = new Vector3();
	const speed = 2.8;
	let { overlayOpen }: { overlayOpen: boolean } = $props();

	let camera = $state<PerspectiveCamera>();
	let yaw = $state(0);
	let pitch = $state(0);

	function handleKeydown(event: KeyboardEvent) {
		if (overlayOpen) return;
		const key = event.key.toLowerCase();

		if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
			event.preventDefault();
			pressed.add(key);
		}
	}

	function handleKeyup(event: KeyboardEvent) {
		pressed.delete(event.key.toLowerCase());
	}

	function handleMousemove(event: MouseEvent) {
		if (overlayOpen) return;
		if (document.pointerLockElement !== dom) return;

		yaw -= event.movementX * 0.0022;
		pitch = MathUtils.clamp(pitch - event.movementY * 0.0022, -0.95, 0.95);
	}

	onMount(() => {
		const requestPointerLock = () => {
			if (!overlayOpen) dom.requestPointerLock();
		};
		dom.addEventListener('click', requestPointerLock);

		return () => dom.removeEventListener('click', requestPointerLock);
	});

	useTask((delta) => {
		if (!camera || overlayOpen) return;

		euler.set(pitch, yaw, 0);
		camera.quaternion.setFromEuler(euler);

		movement.set(0, 0, 0);
		if (pressed.has('w') || pressed.has('arrowup')) movement.z -= 1;
		if (pressed.has('s') || pressed.has('arrowdown')) movement.z += 1;
		if (pressed.has('a') || pressed.has('arrowleft')) movement.x -= 1;
		if (pressed.has('d') || pressed.has('arrowright')) movement.x += 1;

		if (movement.lengthSq() === 0) return;

		movement.normalize();
		forward.set(0, 0, -1).applyQuaternion(camera.quaternion);
		forward.y = 0;
		forward.normalize();
		right.set(1, 0, 0).applyQuaternion(camera.quaternion);
		right.y = 0;
		right.normalize();

		camera.position.addScaledVector(forward, -movement.z * speed * delta);
		camera.position.addScaledVector(right, movement.x * speed * delta);
		camera.position.x = MathUtils.clamp(camera.position.x, -6.15, 6.15);
		camera.position.y = 1.6;
		camera.position.z = MathUtils.clamp(camera.position.z, -6.15, 6.35);
	});
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} onmousemove={handleMousemove} />

<T.PerspectiveCamera bind:ref={camera} makeDefault position={[0, 1.6, 5.8]} fov={68} />
