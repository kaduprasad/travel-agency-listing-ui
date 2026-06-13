"use client";
import * as React from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, Environment } from "@react-three/drei";
import * as THREE from "three";

function FloatingOrbs() {
  const groupRef = React.useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.4}>
        <Sphere args={[1.1, 64, 64]} position={[-1.8, 0.4, 0]}>
          <MeshDistortMaterial color="#3a7dff" attach="material" distort={0.35} speed={1.5} roughness={0.2} metalness={0.7} />
        </Sphere>
      </Float>
      <Float speed={1.2} rotationIntensity={0.4} floatIntensity={1.1}>
        <Sphere args={[0.7, 64, 64]} position={[1.6, -0.5, -0.8]}>
          <MeshDistortMaterial color="#1b4adb" attach="material" distort={0.5} speed={2.1} roughness={0.1} metalness={0.9} />
        </Sphere>
      </Float>
      <Float speed={1.6} rotationIntensity={0.7} floatIntensity={1.6}>
        <Sphere args={[0.45, 48, 48]} position={[0.8, 1.1, 0.4]}>
          <MeshDistortMaterial color="#8ec2ff" attach="material" distort={0.3} speed={1.8} roughness={0.3} metalness={0.6} />
        </Sphere>
      </Float>
    </group>
  );
}

export function Hero3D() {
  return (
    <Canvas
      className="!absolute inset-0"
      camera={{ position: [0, 0, 5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
    >
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1.1} />
      <directionalLight position={[-5, -3, -5]} intensity={0.4} color="#3a7dff" />
      <FloatingOrbs />
      <Environment preset="city" />
    </Canvas>
  );
}

export default Hero3D;
