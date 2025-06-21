
import React from 'react';
import { TrendingUp, Clock, Target, Filter } from 'lucide-react';

interface QuestionFiltersProps {
  currentSort: 'newest' | 'trending' | 'controversial';
  onSortChange: (sort: 'newest' | 'trending' | 'controversial') => void;
}

export const QuestionFilters: React.FC<QuestionFiltersProps> = ({
  currentSort,
  onSortChange
}) => {
  const filters = [
    {
      key: 'newest' as const,
      label: 'NEWEST',
      icon: Clock,
      color: 'cyan'
    },
    {
      key: 'trending' as const,
      label: 'TRENDING',
      icon: TrendingUp,
      color: 'orange'
    },
    {
      key: 'controversial' as const,
      label: 'CONTROVERSIAL',
      icon: Target,
      color: 'red'
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="text-purple-400" size={14} />
        <span className="text-purple-400 font-bold text-xs sm:text-sm">BATTLE FILTER</span>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        {filters.map((filter) => {
          const Icon = filter.icon;
          const isActive = currentSort === filter.key;
          
          return (
            <button
              key={filter.key}
              onClick={() => onSortChange(filter.key)}
              className={`
                relative py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm transition-all duration-300 transform border-2
                ${isActive 
                  ? `bg-gradient-to-br from-${filter.color}-600 to-${filter.color}-700 border-${filter.color}-400 text-white scale-105 shadow-lg shadow-${filter.color}-500/50` 
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500'
                }
              `}
            >
              <div className="flex items-center justify-center gap-1 sm:gap-2">
                <Icon size={14} className="sm:w-4 sm:h-4 flex-shrink-0" />
                <span className="truncate text-xs sm:text-sm">{filter.label}</span>
              </div>
              {isActive && (
                <div className={`absolute inset-0 bg-${filter.color}-400/20 rounded-xl blur-xl opacity-100 transition-opacity -z-10`}></div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
