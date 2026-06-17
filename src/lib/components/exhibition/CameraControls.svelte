<script lang="ts">
	import { T } from '@threlte/core';
	import { OrbitControls } from '@threlte/extras';
</script>

<T.PerspectiveCamera makeDefault position={[0, 2.2, 5.8]} fov={54}>
	<OrbitControls
		target={[0, 1.35, -1.2]}
		enableDamping
		enablePan={false}
		maxPolarAngle={Math.PI / 2.05}
		minDistance={2.6}
		maxDistance={7.5}
	/>
</T.PerspectiveCamera>
