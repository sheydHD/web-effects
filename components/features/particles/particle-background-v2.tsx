"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ParticleSystem = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 2500;

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(999, 999, 0) },
        uResolution: { value: new THREE.Vector2(1, 1) }
    }), []);

    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            uniforms: uniforms,
            vertexShader: `
                uniform float uTime;
                uniform vec3 uMouse;
                
                attribute float size;
                attribute float alpha;
                attribute vec3 aRandom;
                
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    float randomPhase = aRandom.x;
                    float randomSpeed = aRandom.y;
                    float randomVariation = aRandom.z;
                    
                    float dx = pos.x - uMouse.x;
                    float dy = pos.y - uMouse.y;
                    float dist = sqrt(dx * dx + dy * dy);
                    float angle = atan(dy, dx);
                    
                    float baseRadius = 4.0;
                    float borderThickness = 2.5;
                    
                    // V2 Variation: Faster wave, slightly different frequency
                    float wave1 = sin(angle * 3.0 - uTime * 3.0 * randomSpeed + randomPhase) * 0.5;
                    float radiusWithWave = baseRadius + wave1;
                    float distFromBorder = abs(dist - radiusWithWave);
                    
                    float influence = max(0.0, 1.0 - distFromBorder / borderThickness);
                    float centerTransparency = min(dist / baseRadius, 1.0);
                    
                    vec3 finalPos = pos;
                    float finalSize = size;
                    float finalAlpha = alpha;
                    
                    if (influence > 0.0) {
                        float radialPush = wave1 * influence * 2.0 * (0.7 + randomVariation * 0.6);
                        float perpAngle = angle + (randomVariation - 0.5) * 0.5;
                        
                        vec3 push = vec3(
                            cos(perpAngle) * radialPush,
                            sin(perpAngle) * radialPush,
                            wave1 * influence * 0.5 * randomVariation
                        );
                        
                        finalPos += push;
                        
                        float minScale = 0.3 * centerTransparency;
                        float maxScale = 1.5;
                        float scale = minScale + influence * maxScale * centerTransparency;
                        finalSize *= scale;
                        
                        finalAlpha = centerTransparency * 0.9;
                        
                    } else if (dist < baseRadius) {
                        float breathingPhase = uTime * 2.0 * randomSpeed + randomPhase;
                        float breathingAmount = sin(breathingPhase) * 0.3 * randomVariation;
                        
                        float factor = (1.0 - dist / baseRadius);
                        vec3 breathingPush = vec3(
                            cos(angle) * breathingAmount * factor,
                            sin(angle) * breathingAmount * factor,
                            sin(breathingPhase * 1.2) * 0.5 * randomVariation
                        );
                        
                        finalPos += breathingPush;
                        
                        float breathingScale = 0.5 + sin(breathingPhase) * 0.3 * randomVariation;
                        finalSize *= breathingScale * centerTransparency;
                        
                        finalAlpha = centerTransparency * 0.7;
                        
                    } else {
                        finalSize *= 0.4;
                        finalAlpha = 0.1;
                    }
                    
                    vAlpha = finalAlpha;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(finalPos, 1.0);
                    gl_PointSize = finalSize * 2.5 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;
                    gl_FragColor = vec4(vColor, alpha);
                }
            `
        });
    }, [uniforms]);

    const [positions, colors, sizes, randoms] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const randoms = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 35;
            const y = (Math.random() - 0.5) * 25;
            const z = (Math.random() - 0.5) * 5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            randoms[i * 3] = Math.random() * Math.PI * 2;
            randoms[i * 3 + 1] = Math.random() * 0.5 + 0.5;
            randoms[i * 3 + 2] = Math.random();

            // V2: Slightly bluer particles
            colors[i * 3] = 0.2;     // R
            colors[i * 3 + 1] = 0.25; // G
            colors[i * 3 + 2] = 0.35; // B

            sizes[i] = 0.05 + Math.random() * 0.1;
        }

        return [positions, colors, sizes, randoms];
    }, []);

    useFrame((state) => {
        const { clock, pointer, viewport } = state;
        uniforms.uTime.value = clock.getElapsedTime();

        const targetX = (pointer.x * viewport.width) / 2;
        const targetY = (pointer.y * viewport.height) / 2;

        uniforms.uMouse.value.x += (targetX - uniforms.uMouse.value.x) * 0.05;
        uniforms.uMouse.value.y += (targetY - uniforms.uMouse.value.y) * 0.05;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
                <bufferAttribute attach="attributes-color" count={count} array={colors} itemSize={3} />
                <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} />
                <bufferAttribute attach="attributes-aRandom" count={count} array={randoms} itemSize={3} />
            </bufferGeometry>
            <primitive object={shaderMaterial} attach="material" />
        </points>
    );
};

const ParticleBackgroundV2 = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white" style={{ zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
                dpr={[1, 2]}
                gl={{ powerPreference: "high-performance", antialias: false, alpha: false }}
            >
                <color attach="background" args={["#ffffff"]} />
                <ParticleSystem />
            </Canvas>
        </div>
    );
};

export default ParticleBackgroundV2;
