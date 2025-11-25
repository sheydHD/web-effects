import { useEffect, useRef } from 'react';

export type Season = 'winter' | 'spring' | 'summer' | 'autumn';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
}

interface SeasonalBackgroundProps {
  season: Season;
  particleCount?: number;
}

export const SeasonalBackground = ({ 
  season, 
  particleCount = 30 
}: SeasonalBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize particles based on season
    const initParticles = () => {
      particlesRef.current = [];
      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push(createParticle(season));
      }
    };

    initParticles();

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((particle, index) => {
        updateParticle(particle, season);
        drawParticle(ctx, particle, season);

        // Reset particle if it goes off screen
        if (particle.y > canvas.height + 50 || particle.x < -50 || particle.x > canvas.width + 50) {
          particlesRef.current[index] = createParticle(season);
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [season, particleCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

// Create a new particle based on season
const createParticle = (season: Season): Particle => {
  const baseParticle: Particle = {
    x: Math.random() * window.innerWidth,
    y: Math.random() * -window.innerHeight,
    size: 0,
    speedX: 0,
    speedY: 0,
    opacity: 0.3 + Math.random() * 0.4,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
  };

  // Add color variation for spring pollen
  const springColor = Math.floor(Math.random() * 6);
  // Store flower type for summer (use rotation field since we don't rotate)
  const flowerType = Math.floor(Math.random() * 4);

  switch (season) {
    case 'winter':
      // Snowflakes - match autumn distribution
      return {
        ...baseParticle,
        size: 3 + Math.random() * 5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: 0.3 + Math.random() * 0.6,
        opacity: 0.6 + Math.random() * 0.4, // Increased opacity for better visibility
      };
    
    case 'spring':
      // Pollen - colorful gradient, match autumn distribution
      return {
        ...baseParticle,
        size: 3 + Math.random() * 5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: 0.3 + Math.random() * 0.6,
        rotation: springColor, // Use rotation field to store color index
      };
    
    case 'summer':
      // Bees and small flowers - match autumn distribution, no rotation
      return {
        ...baseParticle,
        size: 3 + Math.random() * 5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: 0.3 + Math.random() * 0.6,
        rotation: flowerType, // Store flower type, no rotation applied
        rotationSpeed: 0, // No rotation for summer
      };
    
    case 'autumn':
      // Falling leaves - medium size, swaying
      return {
        ...baseParticle,
        size: 3 + Math.random() * 5,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: 0.3 + Math.random() * 0.6,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      };
    
    default:
      return baseParticle;
  }
};

// Update particle position
const updateParticle = (
  particle: Particle,
  season: Season
) => {
  particle.x += particle.speedX;
  particle.y += particle.speedY;
  particle.rotation += particle.rotationSpeed;

  // Add gentle swaying for certain seasons
  if (season === 'winter' || season === 'autumn') {
    particle.x += Math.sin(particle.y * 0.01) * 0.2;
  }

  // Bees have more erratic movement
  if (season === 'summer') {
    particle.speedX += (Math.random() - 0.5) * 0.05;
    particle.speedY += (Math.random() - 0.5) * 0.05;
    particle.speedX = Math.max(-1, Math.min(1, particle.speedX));
    particle.speedY = Math.max(-0.8, Math.min(0.8, particle.speedY));
  }
};

// Draw particle based on season
const drawParticle = (
  ctx: CanvasRenderingContext2D,
  particle: Particle,
  season: Season
) => {
  ctx.save();
  ctx.translate(particle.x, particle.y);
  ctx.rotate(particle.rotation);
  ctx.globalAlpha = particle.opacity;

  switch (season) {
    case 'winter':
      drawSnowflake(ctx, particle.size);
      break;
    case 'spring':
      drawPollen(ctx, particle.size, Math.floor(particle.rotation));
      break;
    case 'summer':
      // Draw bee or flower based on stored type (don't use random here)
      const storedType = Math.floor(particle.rotation);
      if (storedType % 5 < 2) { // 40% bees
        drawBee(ctx, particle.size);
      } else { // 60% flowers
        drawFlower(ctx, particle.size, storedType);
      }
      break;
    case 'autumn':
      drawLeaf(ctx, particle.size);
      break;
  }

  ctx.restore();
};

// Drawing functions for each particle type
const drawSnowflake = (ctx: CanvasRenderingContext2D, size: number) => {
  // Use light blue color with white center for better visibility
  ctx.fillStyle = '#E0F2FE';
  ctx.strokeStyle = '#BFDBFE';
  ctx.lineWidth = 1.5;
  
  // Draw filled circle center
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
  ctx.fill();
  
  // Draw 6 arms
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.moveTo(0, size * 0.6);
    ctx.lineTo(-size * 0.3, size * 0.8);
    ctx.moveTo(0, size * 0.6);
    ctx.lineTo(size * 0.3, size * 0.8);
    ctx.rotate(Math.PI / 3);
  }
  ctx.stroke();
};

const drawPollen = (ctx: CanvasRenderingContext2D, size: number, colorIndex: number) => {
  // Colorful spring gradient colors
  const colors = [
    '#86EFAC', // Green
    '#7DD3FC', // Blue
    '#C4B5FD', // Purple
    '#FDE047', // Yellow
    '#FCA5A5', // Pink
    '#A7F3D0', // Mint
  ];
  
  ctx.fillStyle = colors[colorIndex % colors.length];
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
  ctx.fill();
};

const drawBee = (ctx: CanvasRenderingContext2D, size: number) => {
  // Body
  ctx.fillStyle = '#FFB300';
  ctx.beginPath();
  ctx.ellipse(0, 0, size, size * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Stripes
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, -size * 0.4);
  ctx.lineTo(-size * 0.3, size * 0.4);
  ctx.moveTo(size * 0.3, -size * 0.4);
  ctx.lineTo(size * 0.3, size * 0.4);
  ctx.stroke();
  
  // Wings
  ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.beginPath();
  ctx.ellipse(-size * 0.6, -size * 0.3, size * 0.5, size * 0.3, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(size * 0.6, -size * 0.3, size * 0.5, size * 0.3, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();
};

const drawFlower = (ctx: CanvasRenderingContext2D, size: number, typeIndex: number) => {
  // Multiple flower types and colors
  const flowerType = Math.floor(typeIndex) % 4;
  
  if (flowerType === 0) {
    // Pink 5-petal flower (original)
    ctx.fillStyle = '#FF69B4';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(size * 0.5, 0, size * 0.4, size * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate((Math.PI * 2) / 5);
    }
    // Center
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else if (flowerType === 1) {
    // Purple 6-petal daisy
    ctx.fillStyle = '#C084FC';
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.ellipse(size * 0.5, 0, size * 0.35, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate((Math.PI * 2) / 6);
    }
    // Center
    ctx.fillStyle = '#FCD34D';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  } else if (flowerType === 2) {
    // Orange 8-petal sunflower-like
    ctx.fillStyle = '#FB923C';
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.ellipse(size * 0.45, 0, size * 0.3, size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate((Math.PI * 2) / 8);
    }
    // Center
    ctx.fillStyle = '#78350F';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Blue 4-petal simple flower
    ctx.fillStyle = '#60A5FA';
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.ellipse(size * 0.5, 0, size * 0.4, size * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate((Math.PI * 2) / 4);
    }
    // Center
    ctx.fillStyle = '#FBBF24';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }
};

const drawLeaf = (ctx: CanvasRenderingContext2D, size: number) => {
  const gradient = ctx.createLinearGradient(-size, -size, size, size);
  gradient.addColorStop(0, '#D2691E');
  gradient.addColorStop(0.5, '#FF8C00');
  gradient.addColorStop(1, '#8B4513');
  
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.quadraticCurveTo(size, 0, 0, size);
  ctx.quadraticCurveTo(-size, 0, 0, -size);
  ctx.fill();
  
  // Vein
  ctx.strokeStyle = '#8B4513';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();
};
