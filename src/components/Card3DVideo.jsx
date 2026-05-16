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
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearMipmapLinearFilter;
      t.magFilter = THREE.LinearFilter;
      t.wrapS = THREE.ClampToEdgeWrapping;
      t.wrapT = THREE.ClampToEdgeWrapping;
      t.repeat.set(1, 1); // Assure qu'il n'y a pas de répétition ou de mise à l'échelle
      t.offset.set(0, 0);
      t.needsUpdate = true;
    });
    
    // Correction de l'orientation pour le verso (flip horizontal indispensable sur mesh inversé)
    backTexture.center.set(0.5, 0.5);
    backTexture.repeat.set(-1, 1);
  }, [frontTexture, backTexture]);

  // Dimensions standard (ratio 1.585)
  const width = 3.37;
  const height = 2.125;
  const radius = 0.1;
  const thickness = 0.08;

  // Forme pour la tranche uniquement
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
      {/* Front Face - Retour à ShapeGeometry pour les bords arrondis */}
      <mesh position={[0, 0, thickness / 2 + 0.002]}>
        <shapeGeometry args={[shape]} />
        <meshPhysicalMaterial 
          map={frontTexture} 
          roughness={0.1} 
          metalness={0} 
          clearcoat={0.3}
          color="#ffffff"
          transparent={true}
        />
      </mesh>

      {/* Back Face */}
      <mesh position={[0, 0, -(thickness / 2 + 0.002)]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[shape]} />
        <meshPhysicalMaterial 
          map={backTexture} 
          roughness={0.1} 
          metalness={0} 
          clearcoat={0.3}
          color="#ffffff"
          transparent={true}
        />
      </mesh>


      {/* Solid Body with Rounded Corners */}
      <mesh position={[0, 0, -thickness / 2]}>
        <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
        <meshPhysicalMaterial 
          color="#111111" 
          roughness={0.4} 
          metalness={0.5}
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
