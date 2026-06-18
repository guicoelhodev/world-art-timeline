<script lang="ts">
	import { T } from '@threlte/core';
</script>

<T.Mesh position={[0, 0, 0]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[14, 30]} />
	<T.MeshStandardMaterial color="#9e9990" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[0, 5.5, 0]} rotation.x={Math.PI / 2}>
	<T.PlaneGeometry args={[14, 30]} />
	<T.MeshStandardMaterial color="#d6d1c7" roughness={1} />
</T.Mesh>

<T.Mesh position={[0, 2.75, -15]}>
	<T.PlaneGeometry args={[14, 5.5]} />
	<T.MeshStandardMaterial color="#d6d1c7" roughness={0.85} />
</T.Mesh>

<T.Mesh position={[-7, 2.75, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[30, 5.5]} />
	<T.MeshStandardMaterial color="#d6d1c7" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[7, 2.75, 0]} rotation.y={-Math.PI / 2}>
	<T.PlaneGeometry args={[30, 5.5]} />
	<T.MeshStandardMaterial color="#d6d1c7" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[0, 2.75, 15]} rotation.y={Math.PI}>
	<T.PlaneGeometry args={[14, 5.5]} />
	<T.MeshStandardMaterial color="#d6d1c7" roughness={0.85} />
</T.Mesh>