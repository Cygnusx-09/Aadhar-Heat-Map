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
                <label className="text-xs font-medium uppercase text-muted-foreground flex justify-between">
                    Geography
                    {(selectedState || selectedDistrict || selectedPincode) && (
                        <button onClick={resetFilters} className="text-primary hover:underline text-[10px]">Reset</button>
                    )}
                </label>

                {/* State Select */}
                <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-ring"
                    value={selectedState || ''}
                    onChange={(e) => drillDown('State', e.target.value)}
                    disabled={states.length === 0}
                >
                    <option value="">Select State</option>
                    {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>

                {/* District Select */}
                <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    value={selectedDistrict || ''}
                    onChange={(e) => drillDown('District', e.target.value)}
                    disabled={!selectedState || districts.length === 0}
                >
                    <option value="">Select District</option>
                    {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>

                {/* Pincode Select */}
                <select
                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    value={selectedPincode || ''}
                    onChange={(e) => drillDown('Pincode', e.target.value)}
                    disabled={!selectedDistrict || pincodes.length === 0}
                >
                    <option value="">Select Pincode</option>
                    {pincodes.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
            </div>
        </div>
    );
};
