import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useMemo } from 'react';
import * as THREE from 'three';
import { buildSurface } from '../lib/mathEngine';
import { useStudioStore } from '../lib/store';

function SurfaceMesh({ expression, sliders }: { expression: string; sliders: Record<string, number> }) {
  const geometry = useMemo(() => {
    const data = buildSurface(expression, sliders);
    const width = data.x.length;
    const height = data.y.length;
    const positions: number[] = [];
    for (let yi = 0; yi < height; yi += 1) {
      for (let xi = 0; xi < width; xi += 1) {
        positions.push(data.x[xi], data.z[yi][xi], data.y[yi]);
      }
    }

    const indices: number[] = [];
    for (let y = 0; y < height - 1; y += 1) {
      for (let x = 0; x < width - 1; x += 1) {
        const a = y * width + x;
        const b = y * width + x + 1;
        const c = (y + 1) * width + x;
        const d = (y + 1) * width + x + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, [expression, sliders]);

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="#58a6ff" metalness={0.2} roughness={0.45} wireframe={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export function Graph3D() {
  const { surfaceExpr, sliders } = useStudioStore();
  const scope = useMemo(() => Object.fromEntries(sliders.map((s) => [s.variable, s.value])), [sliders]);

  return (
    <Canvas camera={{ position: [13, 11, 13], fov: 50 }}>
      <color attach="background" args={['#0d1117']} />
      <ambientLight intensity={0.5} />
      <directionalLight intensity={1.1} position={[10, 15, 5]} />
      <gridHelper args={[24, 24, '#30363d', '#30363d']} />
      <axesHelper args={[8]} />
      <SurfaceMesh expression={surfaceExpr} sliders={scope} />
      <OrbitControls enablePan enableZoom enableRotate />
    </Canvas>
  );
}
