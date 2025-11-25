import { useState } from 'react';
import { SeasonalBackground } from './components/SeasonalBackground';
import type { Season } from './components/SeasonalBackground';
import { Header } from './components/Header';
import './App.css';

function App() {
  const [season, setSeason] = useState<Season>('winter');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <SeasonalBackground season={season} particleCount={40} />
      
      <Header currentSeason={season} onSeasonChange={setSeason} />
      
      <main className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 md:p-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Welcome to Seasonal Backgrounds
          </h2>
          
          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              This demo showcases delicate animated backgrounds that change with each season.
              Use the buttons in the header to switch between different seasonal effects.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <div className="bg-blue-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  ❄️ Winter
                </h3>
                <p className="text-blue-800">
                  Gentle snowflakes drift slowly down the screen with a subtle swaying motion,
                  creating a peaceful winter atmosphere.
                </p>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-green-900 mb-3 flex items-center gap-2">
                  🌸 Spring
                </h3>
                <p className="text-green-800">
                  Tiny pollen particles float delicately through the air, representing
                  the renewal and growth of spring.
                </p>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                  ☀️ Summer
                </h3>
                <p className="text-yellow-800">
                  Small bees buzz around with flowers, capturing the vibrant energy
                  and life of summer days.
                </p>
              </div>
              
              <div className="bg-orange-50 p-6 rounded-xl">
                <h3 className="text-xl font-semibold text-orange-900 mb-3 flex items-center gap-2">
                  🍂 Autumn
                </h3>
                <p className="text-orange-800">
                  Colorful leaves tumble and swirl as they fall, bringing the warm
                  and cozy feeling of autumn.
                </p>
              </div>
            </div>
            
            <div className="mt-12 p-6 bg-gray-50 rounded-xl border border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✨ Delicate particle effects that don't distract from content</li>
                <li>🎨 Custom-drawn particles using HTML5 Canvas</li>
                <li>⚡ Performance-optimized with requestAnimationFrame</li>
                <li>📱 Fully responsive and works on all devices</li>
                <li>🎯 Subtle animations with controlled opacity</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
