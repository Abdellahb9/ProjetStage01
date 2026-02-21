import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import * as THREE from 'three';

interface StarfieldBackgroundProps {
  speedMultiplier?: number;
  starCount?: number;
  children?: React.ReactNode;
}

export default function StarfieldBackground({
  speedMultiplier = 1,
  starCount = 4000,
  children,
}: StarfieldBackgroundProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const currentMount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
    camera.position.z = 400;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const velocities = new Float32Array(starCount);

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      positions[i * 3 + 2] = -Math.random() * 2000;
      velocities[i] = (0.2 + Math.random() * 0.5) * speedMultiplier;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ color: 0xffffff, size: 1.4, sizeAttenuation: true });
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x89cff0, 0.4);
    directionalLight.position.set(0, 0, 1);
    scene.add(directionalLight);

    const clock = new THREE.Clock();
    let animationId: number;

    const animate = () => {
      const delta = clock.getDelta();
      const attribute = geometry.getAttribute('position') as THREE.BufferAttribute;

      for (let i = 0; i < starCount; i++) {
        attribute.array[i * 3 + 2] += velocities[i] * 600 * delta;
        if (attribute.array[i * 3 + 2] > 0) {
          attribute.array[i * 3 + 2] = -2000;
          attribute.array[i * 3] = (Math.random() - 0.5) * 2000;
          attribute.array[i * 3 + 1] = (Math.random() - 0.5) * 2000;
        }
      }

      attribute.needsUpdate = true;
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (currentMount && renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [speedMultiplier, starCount]);

  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: 'black' }}>
      <Box ref={mountRef} sx={{ position: 'absolute', inset: 0 }} />
      <Box sx={{ position: 'relative', zIndex: 1, width: '100%', height: '100%' }}>
        {children}
      </Box>
    </Box>
  );
}
