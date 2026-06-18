<script lang="ts">
	import { T } from '@threlte/core';
</script>

<T.Mesh position={[0, 0, 0]} rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[14, 30]} />
	<T.MeshStandardMaterial color="#9e9990" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[0, 6, 0]} rotation.x={Math.PI / 2}>
	<T.PlaneGeometry args={[14, 30]} />
	<T.MeshStandardMaterial color="#d6d1c6" roughness={1} />
</T.Mesh>

<T.Mesh position={[0, 3, -15]}>
	<T.PlaneGeometry args={[14, 6]} />
	<T.MeshStandardMaterial color="#d6d1c6" roughness={0.85} />
</T.Mesh>

<T.Mesh position={[-6, 3, 0]} rotation.y={Math.PI / 2}>
	<T.PlaneGeometry args={[30, 6]} />
	<T.MeshStandardMaterial color="#d6d1c6" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[6, 3, 0]} rotation.y={-Math.PI / 2}>
	<T.PlaneGeometry args={[30, 6]} />
	<T.MeshStandardMaterial color="#d6d1c6" roughness={0.9} />
</T.Mesh>

<T.Mesh position={[0, 3, 15]} rotation.y={Math.PI}>
	<T.PlaneGeometry args={[14, 6]} />
	<T.MeshStandardMaterial color="#d6d1c6" roughness={0.85} />
</T.Mesh>