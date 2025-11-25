"use client";
/* eslint-disable react-hooks/purity */

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ParticleSystem = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 2000;

    // Uniforms for the shader
    const uniforms = useRef({
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector3(0, 0, 0) }, // Start at center to avoid long travel
        uResolution: { value: new THREE.Vector2(1, 1) }
    }).current;

    // Create shader material with animation logic moved to Vertex Shader
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
                attribute vec3 aRandom; // x: phase, y: speed, z: variation
                
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    
                    // Original position
                    vec3 pos = position;
                    
                    // Get random values
                    float randomPhase = aRandom.x;
                    float randomSpeed = aRandom.y;
                    float randomVariation = aRandom.z;
                    
                    // --- 1. Global Random Wave Movement (2 Wave Functions) ---
                    // Move all points in a random way using 2 distinct waves
                    float globalTime = uTime * 0.5; // Slow ambient movement
                    
                    // Wave 1: Horizontal drift
                    float waveX = sin(globalTime * randomSpeed + randomPhase) * 0.8 * randomVariation;
                    
                    // Wave 2: Vertical drift with different frequency
                    float waveY = cos(globalTime * 0.7 * randomSpeed + randomPhase * 1.5) * 0.8 * randomVariation;
                    
                    pos.x += waveX;
                    pos.y += waveY;
                    
                    
                    // --- 2. Mouse Interaction ---
                    
                    // Calculate distance to mouse
                    float dx = pos.x - uMouse.x;
                    float dy = pos.y - uMouse.y;
                    float dist = sqrt(dx * dx + dy * dy);
                    float angle = atan(dy, dx);
                    
                    // Animation Constants
                    float baseRadius = 3.5;
                    float borderThickness = 2.5;
                    
                    // Interaction Wave Calculation
                    float waveInteraction = sin(angle * 2.0 - uTime * 2.0 * randomSpeed + randomPhase) * 0.2;
                    float radiusWithWave = baseRadius + waveInteraction;
                    float distFromBorder = abs(dist - radiusWithWave);
                    
                    // Influence Calculation
                    float influence = max(0.0, 1.0 - distFromBorder / borderThickness);
                    
                    // Center Proximity
                    float centerTransparency = min(dist / baseRadius, 0.70);
                    
                    // Final Position & Size Variables
                    vec3 finalPos = pos;
                    float finalSize = size;
                    float finalAlpha = alpha;
                    
                    if (influence > 0.0) {
                        // --- INTERACTION ZONE (Wavy Border) ---
                        
                        float radialPush = waveInteraction * influence * 1.5 * (0.7 + randomVariation * 0.6);
                        float perpAngle = angle + (randomVariation - 0.5) * 0.5;
                        
                        vec3 push = vec3(
                            cos(perpAngle) * radialPush,
                            sin(perpAngle) * radialPush,
                            waveInteraction * influence * 0.5 * randomVariation
                        );
                        
                        finalPos += push;
                        
                        // Scale
                        float minScale = 0.3 * centerTransparency;
                        float maxScale = 1.5;
                        float scale = minScale + influence * maxScale * centerTransparency;
                        finalSize *= scale;
                        
                        finalAlpha = centerTransparency * 0.7;
                        
                    } else if (dist < baseRadius) {
                        // --- INSIDE ZONE (Breathing) ---
                        
                        float breathingPhase = uTime * 1.5 * randomSpeed + randomPhase;
                        float breathingAmount = sin(breathingPhase) * 0.3 * randomVariation;
                        
                        // Move back and forth from center
                        float factor = (1.0 - dist / baseRadius);
                        vec3 breathingPush = vec3(
                            cos(angle) * breathingAmount * factor,
                            sin(angle) * breathingAmount * factor,
                            sin(breathingPhase * 1.2) * 0.5 * randomVariation
                        );
                        
                        finalPos += breathingPush;
                        
                        float breathingScale = 0.5 + sin(breathingPhase) * 0.3 * randomVariation;
                        finalSize *= breathingScale * centerTransparency;
                        
                        finalAlpha = centerTransparency * 0.2;
                        
                    } else {
                        // --- OUTSIDE ZONE (Not near pointer) ---
                        // Requirement: "points not near the pointer, bigger, like 30% bigger"
                        // User Edit: Changed to 0.5
                        finalSize *= 0.5; 
                        
                        // Keep them somewhat transparent so they don't overwhelm, but visible
                        finalAlpha = 0.3; 
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
                    // Create circular particles
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) {
                        discard;
                    }
                    
                    // Soft edges
                    float alpha = smoothstep(0.5, 0.3, dist) * vAlpha;
                    
                    gl_FragColor = vec4(vColor, alpha);
                }
            `
        });
    }, [uniforms]);

    // Initialize particles (runs only once)
    const [positions, colors, sizes, randoms] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const randoms = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spread particles
            const x = (Math.random() - 0.5) * 35;
            const y = (Math.random() - 0.5) * 25;
            const z = (Math.random() - 0.5) * 5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Random attributes
            randoms[i * 3] = Math.random() * Math.PI * 2; // Phase
            randoms[i * 3 + 1] = Math.random() * 0.5 + 0.5; // Speed
            randoms[i * 3 + 2] = Math.random(); // Variation

            // Color (Dark Gray)
            colors[i * 3] = 0.2;
            colors[i * 3 + 1] = 0.2;
            colors[i * 3 + 2] = 0.2;

            // Size
            sizes[i] = 0.05 + Math.random() * 0.1;
        }

        return [positions, colors, sizes, randoms];
    }, []);

    // Animation Loop
    const isFirstFrame = useRef(true);

    useFrame((state) => {
        const { clock, pointer, viewport } = state;

        // Update Time
        uniforms.uTime.value = clock.getElapsedTime();

        // Smooth Mouse Follow (Lerp)
        const targetX = (pointer.x * viewport.width) / 2;
        const targetY = (pointer.y * viewport.height) / 2;

        if (isFirstFrame.current && (pointer.x !== 0 || pointer.y !== 0)) {
            // Instant snap on first valid mouse movement
            uniforms.uMouse.value.x = targetX;
            uniforms.uMouse.value.y = targetY;
            isFirstFrame.current = false;
        } else {
            // Requirement: "follow the pointer slower"
            // Reduced lerp factor from 0.05 to 0.02
            uniforms.uMouse.value.x += (targetX - uniforms.uMouse.value.x) * 0.02;
            uniforms.uMouse.value.y += (targetY - uniforms.uMouse.value.y) * 0.02;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    args={[sizes, 1]}
                />
                <bufferAttribute
                    attach="attributes-aRandom"
                    count={count}
                    args={[randoms, 3]}
                />
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
                dpr={[1, 2]} // Optimize for high DPI screens
                gl={{
                    powerPreference: "high-performance",
                    antialias: false,
                    alpha: false
                }}
            >
                <color attach="background" args={["#ffffff"]} />
                <ParticleSystem />
            </Canvas>
        </div>
    );
};

export default ParticleBackgroundV2;