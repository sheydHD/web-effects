"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, type RootState } from "@react-three/fiber";
import * as THREE from "three";

const ParticleSystem = () => {
    const pointsRef = useRef<THREE.Points>(null);
    const count = 2000;
    const mousePos = useRef(new THREE.Vector3(999, 999, 0));
    const targetMousePos = useRef(new THREE.Vector3(999, 999, 0));

    // Create shader material
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
            vertexColors: true,
            vertexShader: `
                attribute float size;
                attribute float alpha;
                varying vec3 vColor;
                varying float vAlpha;
                
                void main() {
                    vColor = color;
                    vAlpha = alpha;
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * 2.5 * (300.0 / -mvPosition.z);
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
    }, []);

    const [positions, colors, sizes, originalPositions, randoms, alphas, originalSizes] = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);
        const originalPositions = new Float32Array(count * 3);
        const randoms = new Float32Array(count * 3); // Random offset per particle
        const alphas = new Float32Array(count); // Transparency per particle
        const originalSizes = new Float32Array(count); // Store original sizes

        for (let i = 0; i < count; i++) {
            // Spread particles across the screen
            const x = (Math.random() - 0.5) * 35;
            const y = (Math.random() - 0.5) * 25;
            const z = (Math.random() - 0.5) * 5;

            positions[i * 3] = x;
            positions[i * 3 + 1] = y;
            positions[i * 3 + 2] = z;

            // Store original positions
            originalPositions[i * 3] = x;
            originalPositions[i * 3 + 1] = y;
            originalPositions[i * 3 + 2] = z;

            // Random values for each particle
            randoms[i * 3] = Math.random() * Math.PI * 2; // Random phase
            randoms[i * 3 + 1] = Math.random() * 0.5 + 0.5; // Random speed multiplier
            randoms[i * 3 + 2] = Math.random(); // Random direction variation

            // Dark gray color
            colors[i * 3] = 0.2;
            colors[i * 3 + 1] = 0.2;
            colors[i * 3 + 2] = 0.2;

            // Vary sizes between 0.05 to 0.15
            const baseSize = 0.05 + Math.random() * 0.1;
            sizes[i] = baseSize;
            originalSizes[i] = baseSize; // Store original size

            // Initialize alpha
            alphas[i] = 1.0;
        }

        return [positions, colors, sizes, originalPositions, randoms, alphas, originalSizes];
    }, []);

    useFrame((state: any) => {
        if (!pointsRef.current) return;

        const { pointer, camera, viewport } = state;

        // Convert normalized pointer (-1 to 1) to world coordinates
        // viewport gives us the visible width and height at z=0
        targetMousePos.current.x = (pointer.x * viewport.width) / 2;
        targetMousePos.current.y = (pointer.y * viewport.height) / 2;

        // Lazy follow with lerp (linear interpolation)
        const lerpFactor = 0.015; // Lower = more lag, higher = faster follow (0-1)
        mousePos.current.x += (targetMousePos.current.x - mousePos.current.x) * lerpFactor;
        mousePos.current.y += (targetMousePos.current.y - mousePos.current.y) * lerpFactor;

        const positionAttr = pointsRef.current.geometry.attributes.position;
        const sizeAttr = pointsRef.current.geometry.attributes.size;
        const alphaAttr = pointsRef.current.geometry.attributes.alpha;
        const time = state.clock.getElapsedTime();

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Get original position
            const origX = originalPositions[i3];
            const origY = originalPositions[i3 + 1];
            const origZ = originalPositions[i3 + 2];

            // Get random values for this particle
            const randomPhase = randoms[i3];
            const randomSpeed = randoms[i3 + 1];
            const randomVariation = randoms[i3 + 2];

            // Calculate distance to mouse
            const dx = origX - mousePos.current.x;
            const dy = origY - mousePos.current.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            // Calculate angle for this particle relative to mouse
            const angle = Math.atan2(dy, dx);

            // Base radius for the circle
            const baseRadius = 4;

            // Apply sine wave with per-particle random phase (2-3 peaks around the circle)
            const wave1 = Math.sin(angle * 2 - time * 2 * randomSpeed + randomPhase) * 0.5;

            // The radius varies as we go around the circle
            const radiusWithWave = baseRadius + wave1;

            // Distance from particle to the wavy border
            const distFromBorder = Math.abs(dist - radiusWithWave);
            const borderThickness = 2.5; // How thick the interaction zone is

            // Influence is highest at the border, drops off away from it
            const influence = Math.max(0, 1 - distFromBorder / borderThickness);

            // Distance-based transparency (closer to mouse center = more transparent)
            const maxDist = 20;
            const distanceFromCenter = Math.sqrt(origX * origX + origY * origY);
            const transparencyFactor = 1 - Math.min(distanceFromCenter / maxDist, 0.7);

            // Make particles near mouse center more transparent
            const centerTransparency = Math.min(dist / baseRadius, 1); // 0 at center, 1 at radius

            if (influence > 0) {
                // Push particles radially based on the wave with random variation
                const radialPush = wave1 * influence * 1.8 * (0.7 + randomVariation * 0.6);

                // Add some random perpendicular motion
                const perpAngle = angle + (randomVariation - 0.5) * 0.5;

                const pushX = Math.cos(perpAngle) * radialPush;
                const pushY = Math.sin(perpAngle) * radialPush;
                const pushZ = wave1 * influence * 0.5 * randomVariation;

                positionAttr.setXYZ(
                    i,
                    origX + pushX,
                    origY + pushY,
                    origZ + pushZ
                );

                // Scale particles significantly based on influence and center proximity
                // Particles near center are smaller/more transparent
                const baseSize = originalSizes[i];
                const minScale = 0.3 * centerTransparency; // Smaller when at center
                const maxScale = 1.5;
                const scale = minScale + influence * maxScale * centerTransparency;
                sizeAttr.setX(i, baseSize * scale);

                // Set alpha based on center proximity
                alphaAttr.setX(i, centerTransparency * 0.9);
            } else if (dist < baseRadius) {
                // Particles inside the circle: breathing effect with random variation
                const breathingPhase = time * 1.5 * randomSpeed + randomPhase;
                const breathingAmount = Math.sin(breathingPhase) * 0.3 * randomVariation;

                // Move particles back and forth from center
                const breathingPushX = Math.cos(angle) * breathingAmount * (1 - dist / baseRadius);
                const breathingPushY = Math.sin(angle) * breathingAmount * (1 - dist / baseRadius);
                const breathingPushZ = Math.sin(breathingPhase * 1.2) * 0.2 * randomVariation;

                positionAttr.setXYZ(
                    i,
                    origX + breathingPushX,
                    origY + breathingPushY,
                    origZ + breathingPushZ
                );

                // Breathing size variation with center transparency
                const baseSize = originalSizes[i];
                const breathingScale = 0.5 + Math.sin(breathingPhase) * 0.3 * randomVariation;
                sizeAttr.setX(i, baseSize * breathingScale * centerTransparency);

                // Set alpha for breathing particles
                alphaAttr.setX(i, centerTransparency * 0.7);
            } else {
                // Make uninfluenced particles smaller but visible
                const baseSize = originalSizes[i];
                sizeAttr.setX(i, baseSize * 0.4);
                alphaAttr.setX(i, 0.1); // Very transparent
                // Return to original position
                positionAttr.setXYZ(i, origX, origY, origZ);
            }
        }

        positionAttr.needsUpdate = true;
        sizeAttr.needsUpdate = true;
        alphaAttr.needsUpdate = true;
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    count={count}
                    array={colors}
                    itemSize={3}
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    count={count}
                    array={sizes}
                    itemSize={1}
                    args={[sizes, 1]}
                />
                <bufferAttribute
                    attach="attributes-alpha"
                    count={count}
                    array={alphas}
                    itemSize={1}
                    args={[alphas, 1]}
                />
            </bufferGeometry>
            <primitive object={shaderMaterial} attach="material" />
        </points>
    );
};

const ParticleBackground = () => {
    return (
        <div className="fixed top-0 left-0 w-full h-full bg-white" style={{ zIndex: 0 }}>
            <Canvas
                camera={{ position: [0, 0, 15], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
            >
                <color attach="background" args={["#ffffff"]} />
                <ParticleSystem />
            </Canvas>
        </div>
    );
};

export default ParticleBackground;
