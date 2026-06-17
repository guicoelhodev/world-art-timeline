<script lang="ts">
	import { T } from '@threlte/core';
</script>

<T.Mesh position={[0, 0, 0]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[8, 8]} />
	<T.MeshStandardMaterial color="#d8d0c3" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[0, 3, 0]} rotation.x={Math.PI / 2}>
	<T.PlaneGeometry args={[8, 8]} />
	<T.MeshStandardMaterial color="#eee9df" roughness={1} />
</T.Mesh>

<T.Mesh position={[0, 1.5, -4]}>
	<T.PlaneGeometry args={[8, 3]} />
	<T.MeshStandardMaterial color="#f1eadf" roughness={0.85} />
</T.Mesh>

<T.Mesh position={[-4, 1.5, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[8, 3]} />
	<T.MeshStandardMaterial color="#e6ded2" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[4, 1.5, 0]} rotation.y={-Math.PI / 2}>
	<T.PlaneGeometry args={[8, 3]} />
	<T.MeshStandardMaterial color="#e6ded2" roughness={0.9} />
</T.Mesh>
