import React from 'react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export const AgeGroupFilter: React.FC = () => {
    const { ageGroup, setAgeGroup } = useStore();

    const options = ['Total', '5-17', '17+'] as const;

    return (
        <div className="flex bg-black border border-white/10 p-0.5 rounded-sm">
            {options.map((option) => (
                <button
                    key={option}
                    onClick={() => setAgeGroup(option)}
                    className={cn(
                        "flex-1 px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider transition-all rounded-sm",
                        ageGroup === option
                            ? "bg-accent-blue/10 text-accent-blue border border-accent-blue/20 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                            : "text-gray-500 hover:text-white hover:bg-white/5"
                    )}
                >
                    {option === 'Total' ? 'All' : option}
                </button>
            ))}
        </div>
    );
};
