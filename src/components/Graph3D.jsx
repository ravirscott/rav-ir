import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { compileExpression, normalizeExpression } from '../utils/mathEngine';

function buildSurface(expression, sliders, color) {
  const fn = compileExpression(normalizeExpression(expression).replace(/^z\s*=\s*/i, ''));
  const sliderScope = Object.fromEntries(Object.entries(sliders).map(([k, v]) => [k, v.value]));
  const size = 100;
  const step = 0.2;
  const positions = [];

  for (let i = 0; i < size - 1; i++) {
    for (let j = 0; j < size - 1; j++) {
      const x = (i - size / 2) * step;
      const y = (j - size / 2) * step;
      const p1 = new THREE.Vector3(x, Number(fn.evaluate({ ...sliderScope, x, y })) || 0, y);
      const p2 = new THREE.Vector3(x + step, Number(fn.evaluate({ ...sliderScope, x: x + step, y })) || 0, y);
      const p3 = new THREE.Vector3(x, Number(fn.evaluate({ ...sliderScope, x, y: y + step })) || 0, y + step);
      const p4 = new THREE.Vector3(x + step, Number(fn.evaluate({ ...sliderScope, x: x + step, y: y + step })) || 0, y + step);

      positions.push(...p1.toArray(), ...p2.toArray(), ...p3.toArray(), ...p2.toArray(), ...p4.toArray(), ...p3.toArray());
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.computeVertexNormals();
  const material = new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85, roughness: 0.45, metalness: 0.1 });
  return new THREE.Mesh(geometry, material);
}

export default function Graph3D({ equations, sliders }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const width = mount.clientWidth;
    const height = mount.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0d1117');

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(8, 6, 10);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.HemisphereLight('#ffffff', '#0d1117', 1));
    const key = new THREE.DirectionalLight('#58a6ff', 1.1);
    key.position.set(8, 12, 7);
    scene.add(key);
    scene.add(new THREE.GridHelper(20, 20, '#30363d', '#21262d'));
    scene.add(new THREE.AxesHelper(4));

    equations
      .filter((eq) => eq.visible && /^\s*z\s*=/.test(eq.expression))
      .forEach((eq) => {
        try {
          scene.add(buildSurface(eq.expression, sliders, eq.color));
        } catch {
          // ignore invalid equation
        }
      });

    let frame;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    render();

    const resize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material && typeof obj.material.dispose === 'function') obj.material.dispose();
      });
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [equations, sliders]);

  return <div ref={mountRef} className="three-wrap" />;
}
