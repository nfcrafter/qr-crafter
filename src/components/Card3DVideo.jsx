import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { 
  Stage, 
  ContactShadows, 
  Environment, 
  PerspectiveCamera, 
  Float,
  useTexture
} from '@react-three/drei';
import * as THREE from 'three';

const Card = ({ frontImage, backImage }) => {
  const meshRef = useRef();
  
  // Textures loading
  const frontTexture = useTexture(frontImage);
  const backTexture = useTexture(backImage);
  
  // Flip back texture horizontally because it will be mirrored on the back face
  useMemo(() => {
    backTexture.repeat.set(-1, 1);
    backTexture.offset.set(1, 0);
  }, [backTexture]);

  // Dimensions
  const width = 3.37; // Standard credit card width
  const height = 2.125; // Standard credit card height
  const depth = 0.04; // Very thin
  const radius = 0.15; // Corner radius

  // Create rounded rectangle shape for extrusion
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

  const extrudeSettings = {
    steps: 1,
    depth: depth,
    bevelEnabled: true,
    bevelThickness: 0.01,
    bevelSize: 0.01,
    bevelOffset: 0,
    bevelSegments: 5
  };

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Smooth 360 degree rotation
    meshRef.current.rotation.y = t * 1.5;
    // Slight vertical wobble
    meshRef.current.position.y = Math.sin(t) * 0.1;
  });

  return (
    <group ref={meshRef}>
      <mesh>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        {/* Multimaterial: Front, Back, Edges */}
        <meshPhysicalMaterial 
          attach="material-0" 
          color="#1A1265" 
          roughness={0.1} 
          metalness={0.2} 
          clearcoat={1}
        />
        <meshPhysicalMaterial 
          attach="material-1" 
          map={frontTexture} 
          roughness={0.1} 
          metalness={0.1} 
          clearcoat={1}
        />
        <meshPhysicalMaterial 
          attach="material-2" 
          map={backTexture} 
          roughness={0.1} 
          metalness={0.1} 
          clearcoat={1}
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
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        onCreated={({ gl }) => onCanvasReady && onCanvasReady(gl.domElement)}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={40} />
        <Environment preset="city" />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <Card frontImage={frontImage} backImage={backImage} />
        </Float>

        <ContactShadows 
          position={[0, -2, 0]} 
          opacity={0.4} 
          scale={10} 
          blur={2.5} 
          far={4} 
        />
      </Canvas>
    </div>
  );
};

export default Card3DVideo;
