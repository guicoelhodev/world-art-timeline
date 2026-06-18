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

	let camera = $state<PerspectiveCamera>();
	let yaw = $state(0);
	let pitch = $state(0);
	let ctrlPressed = $state(false);
	let zoomFov = $state(68);

	const normalFov = 68;
	const zoomedFov = 25;
	const zoomLerpSpeed = 10;
	const normalSpeed = 5;
	const zoomedSpeed = 1.5;

	function handleKeydown(event: KeyboardEvent) {
		const key = event.key.toLowerCase();

		if (key === 'control') {
			event.preventDefault();
			ctrlPressed = true;
			return;
		}

		if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright'].includes(key)) {
			event.preventDefault();
			pressed.add(key);
		}
	}

	function handleKeyup(event: KeyboardEvent) {
		const key = event.key.toLowerCase();
		if (key === 'control') {
			ctrlPressed = false;
			return;
		}
		pressed.delete(key);
	}

	function handleMousemove(event: MouseEvent) {
		if (document.pointerLockElement !== dom) return;

		yaw -= event.movementX * 0.0022;
		pitch = MathUtils.clamp(pitch - event.movementY * 0.0022, -0.95, 0.95);
	}

	onMount(() => {
		const requestPointerLock = () => {
			dom.requestPointerLock();
		};
		dom.addEventListener('click', requestPointerLock);

		return () => dom.removeEventListener('click', requestPointerLock);
	});

	useTask((delta) => {
		if (!camera) return;

		euler.set(pitch, yaw, 0);
		camera.quaternion.setFromEuler(euler);

		const targetFov = ctrlPressed ? zoomedFov : normalFov;
		zoomFov = MathUtils.lerp(zoomFov, targetFov, Math.min(zoomLerpSpeed * delta, 1));
		camera.fov = zoomFov;
		camera.updateProjectionMatrix();

		const speed = ctrlPressed ? zoomedSpeed : normalSpeed;

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
		camera.position.x = MathUtils.clamp(camera.position.x, -5.8, 5.8);
		camera.position.y = 1.6;
		camera.position.z = MathUtils.clamp(camera.position.z, -14.15, 14.35);
	});
</script>

<svelte:window onkeydown={handleKeydown} onkeyup={handleKeyup} onmousemove={handleMousemove} />
<T.PerspectiveCamera bind:ref={camera} makeDefault position={[0, 1.6, 0]} fov={68} />
