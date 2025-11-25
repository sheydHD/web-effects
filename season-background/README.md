# Multi-Background Seasonal Particle Effects

A delicate animated background system that changes with the seasons, built with React, TypeScript, and HTML5 Canvas.

## Features

- **Four Seasonal Themes**:
  - ❄️ **Winter**: Gentle snowflakes drifting down with swaying motion
  - 🌸 **Spring**: Tiny pollen particles floating delicately
  - ☀️ **Summer**: Small bees buzzing around with flowers
  - 🍂 **Autumn**: Colorful leaves tumbling and swirling

- **Performance Optimized**: Uses HTML5 Canvas with `requestAnimationFrame` for smooth 60fps animations
- **Non-Intrusive**: Subtle particle effects with controlled opacity (0.6) that don't distract from content
- **Fully Responsive**: Adapts to any screen size
- **Easy Season Switching**: Header buttons with Lucide icons for quick theme changes

## Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Lucide React for icons
- HTML5 Canvas for particle rendering

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── SeasonalBackground.tsx  # Canvas-based particle system
│   └── Header.tsx              # Season selector UI
├── App.tsx                     # Main application
├── App.css                     # App styles
└── index.css                   # Global styles + Tailwind
```

## How It Works

### Particle System
Each season has unique particle characteristics:

- **Particle Count**: Configurable (default: 40)
- **Size Range**: 1-8px depending on season
- **Speed**: Very slow (0.1-0.8 pixels per frame)
- **Opacity**: 0.2-0.7 for subtle effect

### Canvas Rendering
- Custom drawing functions for each particle type
- Snowflakes: 6-pointed star pattern
- Pollen: Simple golden circles
- Bees: Ellipse body with stripes and wings
- Flowers: 5-petal design with center
- Leaves: Gradient-filled curved shapes with veins

## Customization

### Adjust Particle Count
```tsx
<SeasonalBackground season={season} particleCount={60} />
```

### Modify Particle Behavior
Edit the `createParticle` function in `SeasonalBackground.tsx` to adjust size, speed, opacity, and movement patterns.

## Integration

To integrate into an existing project:

1. Copy `components/SeasonalBackground.tsx`
2. Import and add to your layout:
```tsx
import { SeasonalBackground } from './components/SeasonalBackground';

function Layout() {
  return (
    <>
      <SeasonalBackground season="winter" particleCount={40} />
      {/* Your content here */}
    </>
  );
}
```

## Browser Support

Works in all modern browsers that support HTML5 Canvas and RequestAnimationFrame.

## License

MIT
