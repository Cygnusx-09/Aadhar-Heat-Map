import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';

export const GeographyFilter: React.FC = () => {
    const {
        rawRecords,
        selectedState,
        selectedDistrict,
        selectedPincode,
        drillDown,
        resetFilters
    } = useStore();

    // Compute available options based on HIERARCHY from RAW records
    // We want all available states regardless of date filter to allow user to narrow down geography first if they want.
    // Or should we respect date filter? Usually Hierarchy filters are "Dimensions" and independent or cascaded.
    // For now, let's derive from rawRecords to show full possibilities.

    const states = useMemo(() => {
        const unique = new Set(rawRecords.map(r => r.state));
        return Array.from(unique).sort();
    }, [rawRecords]);

    const districts = useMemo(() => {
        if (!selectedState) return [];
        const unique = new Set(
            rawRecords
                .filter(r => r.state === selectedState)
                .map(r => r.district)
        );
        return Array.from(unique).sort();
    }, [rawRecords, selectedState]);

    const pincodes = useMemo(() => {
        if (!selectedDistrict) return [];
        const unique = new Set(
            rawRecords
                .filter(r => r.district === selectedDistrict)
                .map(r => r.pincode)
        );
        return Array.from(unique).sort();
    }, [rawRecords, selectedDistrict]);

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider flex justify-between">
                    Geography
                    {(selectedState || selectedDistrict || selectedPincode) && (
                        <button onClick={resetFilters} className="text-accent-red hover:underline text-[10px]">RESET</button>
                    )}
                </label>

                {/* State Select */}
                <select
                    className="h-8 w-full rounded-sm border border-white/10 bg-black px-2 py-1 text-xs font-mono text-white shadow-none focus-visible:outline-none focus:border-accent-blue/50 appearance-none"
                    value={selectedState || ''}
                    onChange={(e) => drillDown('State', e.target.value)}
                    disabled={states.length === 0}
                >
                    <option value="">SELECT STATE</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* District Select */}
                <select
                    className="h-8 w-full rounded-sm border border-white/10 bg-black px-2 py-1 text-xs font-mono text-white shadow-none focus-visible:outline-none focus:border-accent-blue/50 disabled:opacity-30 disabled:cursor-not-allowed appearance-none"
                    value={selectedDistrict || ''}
                    onChange={(e) => drillDown('District', e.target.value)}
                    disabled={!selectedState || districts.length === 0}
                >
                    <option value="">SELECT DISTRICT</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Pincode Select */}
                <select
                    className="h-8 w-full rounded-sm border border-white/10 bg-black px-2 py-1 text-xs font-mono text-white shadow-none focus-visible:outline-none focus:border-accent-blue/50 disabled:opacity-30 disabled:cursor-not-allowed appearance-none"
                    value={selectedPincode || ''}
                    onChange={(e) => drillDown('Pincode', e.target.value)}
                    disabled={!selectedDistrict || pincodes.length === 0}
                >
                    <option value="">SELECT PINCODE</option>
                    {pincodes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>
    );
};
