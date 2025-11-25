import { Snowflake, Flower2, Sun, Leaf } from 'lucide-react';
import type { Season } from './SeasonalBackground';

interface HeaderProps {
  currentSeason: Season;
  onSeasonChange: (season: Season) => void;
}

const seasonConfigs = {
  winter: { icon: Snowflake, label: 'Winter', bgClass: 'bg-blue-400', textClass: 'text-blue-400' },
  spring: { icon: Flower2, label: 'Spring', bgClass: 'bg-green-400', textClass: 'text-green-400' },
  summer: { icon: Sun, label: 'Summer', bgClass: 'bg-yellow-400', textClass: 'text-yellow-400' },
  autumn: { icon: Leaf, label: 'Autumn', bgClass: 'bg-orange-400', textClass: 'text-orange-400' },
};

export const Header = ({ currentSeason, onSeasonChange }: HeaderProps) => {
  return (
    <header className="relative z-10 bg-white/80 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">
            Seasonal Background Demo
          </h1>
          
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 mr-2">Season:</span>
            {Object.entries(seasonConfigs).map(([key, config]) => {
              const Icon = config.icon;
              const isActive = currentSeason === key;
              return (
                <button
                  key={key}
                  onClick={() => onSeasonChange(key as Season)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                    transition-all duration-200
                    ${isActive
                      ? `${config.bgClass} text-white shadow-md scale-105`
                      : `${config.textClass} hover:bg-gray-100`
                    }
                  `}
                  title={config.label}
                >
                  <Icon size={20} />
                  <span className="hidden sm:inline">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
};
