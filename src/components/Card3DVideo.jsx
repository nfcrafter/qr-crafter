import React, { useRef, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { 
  ContactShadows, 
  Environment, 
  PerspectiveCamera, 
  Float,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';

const CardContent = ({ frontImage, backImage }) => {
  const groupRef = useRef();
  
  // Textures loading with high-quality settings
  const frontTexture = useTexture(frontImage);
  const backTexture = useTexture(backImage);
  
  useMemo(() => {
    [frontTexture, backTexture].forEach(t => {
      t.anisotropy = 16;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.needsUpdate = true;
    });
  }, [frontTexture, backTexture]);

  // Dimensions
  const width = 3.37;
  const height = 2.125;
  const radius = 0.12;
  const thickness = 0.08; // Augmenté pour un aspect plus solide

  // Create rounded rectangle shape
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    s.moveTo(x + radius, y);
    s.lineTo(x + width - radius, y);
    s.quadraticCurveTo(x + width, y, x + width, y + radius);
    s.lineTo(x + width, y + height - radius);
    s.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    s.lineTo(x + radius, y + height);
    s.quadraticCurveTo(x, y + height, x, y + height - radius);
    s.lineTo(x, y + radius);
    s.quadraticCurveTo(x, y, x + radius, y);
    return s;
  }, [width, height, radius]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    groupRef.current.rotation.y = t * 1.5;
    groupRef.current.position.y = Math.sin(t) * 0.1;
  });

  return (
    <group ref={groupRef}>
      {/* Front Face */}
      <mesh position={[0, 0, thickness / 2 + 0.001]}>
        <shapeGeometry args={[shape]} />
        <meshPhysicalMaterial 
          map={frontTexture} 
          roughness={0.1} 
          metalness={0.05} 
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive="#ffffff"
          emissiveIntensity={0.02}
        />
      </mesh>

      {/* Back Face */}
      <mesh position={[0, 0, -(thickness / 2 + 0.001)]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[shape]} />
        <meshPhysicalMaterial 
          map={backTexture} 
          roughness={0.1} 
          metalness={0.05} 
          clearcoat={1}
          clearcoatRoughness={0.05}
          emissive="#ffffff"
          emissiveIntensity={0.02}
        />
      </mesh>

      {/* Middle Edge (Extruded) */}
      <mesh position={[0, 0, -thickness / 2]}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
        <meshPhysicalMaterial 
          color="#111111" 
          roughness={0.2} 
          metalness={0.8}
        />
      </mesh>
    </group>
  );
};

const Card3DVideo = ({ frontImage, backImage, onCanvasReady }) => {
  if (!frontImage || !backImage) return null;

  return (
    <div style={{ width: '100%', height: '100%', background: '#0F172A' }}>
      <Canvas 
        dpr={[1, 2]} // Force haute résolution sur écrans Retina/4K
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: false, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => onCanvasReady && onCanvasReady(gl.domElement)}
      >
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={35} />
          <Environment preset="studio" />
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          
          <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <CardContent frontImage={frontImage} backImage={backImage} />
          </Float>

          <ContactShadows 
            position={[0, -1.8, 0]} 
            opacity={0.6} 
            scale={10} 
            blur={2} 
            far={4} 
          />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default Card3DVideo;
