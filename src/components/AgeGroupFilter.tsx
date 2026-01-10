import React from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export const AgeGroupFilter: React.FC = () => {
    const { ageGroup, setAgeGroup } = useStore();

    const options = ['Total', '5-17', '17+'] as const;

    return (
        <div className="flex bg-gray-100 p-1 rounded-lg">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => setAgeGroup(option)}
                    className={cn(
                        "flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                        ageGroup === option
                            ? "bg-white text-primary shadow-sm"
                            : "text-muted-foreground hover:text-gray-900"
                    )}
                >
                    {option === 'Total' ? 'All Ages' : option}
                </button>
            ))}
        </div>
    );
};
