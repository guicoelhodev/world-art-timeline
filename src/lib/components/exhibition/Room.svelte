<script lang="ts">
	import { T } from '@threlte/core';
</script>

<T.Mesh position={[0, 0, 0]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[14, 14]} />
	<T.MeshStandardMaterial color="#d8d0c3" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[0, 5.5, 0]} rotation.x={Math.PI / 2}>
	<T.PlaneGeometry args={[14, 14]} />
	<T.MeshStandardMaterial color="#eee9df" roughness={1} />
</T.Mesh>

<T.Mesh position={[0, 2.75, -7]}>
	<T.PlaneGeometry args={[14, 5.5]} />
	<T.MeshStandardMaterial color="#f1eadf" roughness={0.85} />
</T.Mesh>

<T.Mesh position={[-7, 2.75, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[14, 5.5]} />
	<T.MeshStandardMaterial color="#e6ded2" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[7, 2.75, 0]} rotation.y={-Math.PI / 2}>
	<T.PlaneGeometry args={[14, 5.5]} />
	<T.MeshStandardMaterial color="#e6ded2" roughness={0.9} />
</T.Mesh>
