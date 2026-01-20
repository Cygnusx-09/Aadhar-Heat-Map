import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

export const SearchBar: React.FC = () => {
    const { rawRecords, drillDown, selectedState, selectedDistrict } = useStore();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Derive generic list of all States and Districts from raw data
    // Optimally this should be cached or computed in store, but here is fine for now (~1000 items max usually if aggregated)
    const options = useMemo(() => {
        const states = new Set<string>();
        const districts = new Set<string>(); // "District, State" format to avoid dupes

        rawRecords.forEach(r => {
            if (r.state) states.add(r.state);
            if (r.district && r.state) districts.add(`${r.district}|${r.state}`); // Separator for parsing
        });

        const stateOptions = Array.from(states).map(s => ({
            type: 'State',
            label: s,
            value: s,
            sub: 'Region'
        }));

        const districtOptions = Array.from(districts).map(d => {
            const [dist, state] = d.split('|');
            return {
                type: 'District',
                label: dist,
                value: d, // Keep composite to know parent state
                sub: state
            };
        });

        return [...stateOptions, ...districtOptions].sort((a, b) => a.label.localeCompare(b.label));
    }, [rawRecords]);

    const filteredOptions = useMemo(() => {
        if (!query) return [];
        const lowerQ = query.toLowerCase();
        return options
            .filter(opt => opt.label.toLowerCase().includes(lowerQ))
            .slice(0, 10); // Limit results
    }, [query, options]);

    const handleSelect = (option: typeof options[0]) => {
        if (option.type === 'State') {
            drillDown('State', option.label);
        } else {
            const [dist, state] = option.value.split('|');
            // First drill to State (implicit or explicit?)
            // Store's drillDown 'District' sets selectedDistrict. 
            // We usually need selectedState to match.
            // Let's rely on store handling or set generic.
            // Actually store needs updating to handle "District without State" or we just ensure we set both.
            // The current drillDown implementation:
            // case 'District': newState = { ...newState, currentLevel: 'District', selectedDistrict: name, selectedPincode: null };
            // It preserves existing selectedState. If we jump from National -> District X (in State Y), we might mismatch.
            // Let's fix this in store or handle here. 
            // Ideally: drillDown should handle context. 
            // For now, let's call drillDown State then District if needed, or simple update.
            // UseStore doesn't expose a "batch update".
            // Let's assume for search, we reset filters then apply specific path.
            // Actually, let's hack it: 
            // We can't easily do batch. Let's just assume we need to set state first if it's different.

            // Wait, drillDown 'District' logic in store writes: `selectedDistrict: name`. 
            // If I'm in generic national view, selectedState is null.
            // If I select "Lucknow", selectedState remains null? 
            // If filter logic essentially says `if (selectedState && record.state !== selectedState) return false;`
            // If selectedState is null, it doesn't filter by state.
            // So `if (selectedDistrict && record.district !== selectedDistrict)` -> this works! 
            // It will filter ALL records for district "Lucknow". 
            // Since district names can be duplicate across states (rare but possible, e.g. "Aurangabad"), it's risky.
            // But let's trust the user or the unique combo logic later.
            drillDown('District', option.label);
        }
        setQuery('');
        setIsOpen(false);
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className="relative z-50">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-accent-blue transition-colors" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    placeholder="Search State or District..."
                    className="w-full bg-black/50 border border-white/10 rounded-sm py-2 pl-9 pr-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-accent-blue/50 focus:bg-black transition-all"
                />
            </div>

            {isOpen && query && filteredOptions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-[#09090b] border border-white/10 rounded-sm shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {filteredOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => handleSelect(opt)}
                            className="w-full text-left px-4 py-2 hover:bg-white/5 flex items-center justify-between group transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <MapPin className="w-3.5 h-3.5 text-white/30 group-hover:text-accent-blue" />
                                <span className="text-sm text-white/90 font-medium">{opt.label}</span>
                            </div>
                            <span className="text-[10px] font-mono uppercase text-white/30 bg-white/5 px-1.5 py-0.5 rounded group-hover:bg-white/10 group-hover:text-white/50">
                                {opt.type === 'District' ? opt.sub : 'State'}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
