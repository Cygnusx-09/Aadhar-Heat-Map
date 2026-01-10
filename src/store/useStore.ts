import { create } from 'zustand';
import { AppState, DemographicRecord, GeographicLevel } from '../types';
import { startOfMonth, endOfMonth } from 'date-fns';

// Helper to separate filter logic
const applyFilters = (state: AppState): AppState => {
    const { rawRecords, dateRange, selectedState, selectedDistrict, selectedPincode } = state;
    const { start, end } = dateRange;

    // Helper to parse DD-MM-YYYY
    const parseDate = (dateStr: string) => {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    };

    const filtered = rawRecords.filter(record => {
        // 1. Date Filter
        if (start && end) {
            const recordDate = parseDate(record.date);
            if (!recordDate || recordDate < start || recordDate > end) return false;
        }

        // 2. Geography Filter
        if (selectedState && record.state !== selectedState) return false;
        if (selectedDistrict && record.district !== selectedDistrict) return false;
        if (selectedPincode && record.pincode !== selectedPincode) return false;

        return true;
    });

    return { ...state, filteredRecords: filtered };
};

export const useStore = create<AppState>((set) => ({
    rawRecords: [],
    filteredRecords: [],
    uploadedFiles: [],

    currentLevel: 'National',
    selectedState: null,
    selectedDistrict: null,
    selectedPincode: null,

    dateRange: {
        start: null,
        end: null,
    },

    ageGroup: 'Total',
    populationRange: [0, 10000000],

    isLoading: false,
    error: null,

    addRawData: (data, file) => set((state) => {
        const newRecords = [...state.rawRecords, ...data];
        const newFiles = [...state.uploadedFiles, file];

        // Update state and re-apply filters (even if filters are empty)
        const newState = {
            ...state,
            rawRecords: newRecords,
            uploadedFiles: newFiles,
            isLoading: false,
            error: null
            // Note: We keep existing filters to allow "add data to current view"
        };
        return applyFilters(newState);
    }),

    removeFile: (fileId) => set((state) => {
        const newFiles = state.uploadedFiles.filter(f => f.id !== fileId);
        const newRecords = state.rawRecords.filter(r => r.fileId !== fileId);

        const newState = {
            ...state,
            uploadedFiles: newFiles,
            rawRecords: newRecords,
        };
        return applyFilters(newState);
    }),

    setFilters: (filters) => set((state) => {
        const newState = { ...state, ...filters };
        return applyFilters(newState);
    }),

    setAgeGroup: (group) => set((state) => {
        const newState = { ...state, ageGroup: group };
        return applyFilters(newState);
    }),

    drillDown: (level, name) => set((state) => {
        let newState = { ...state };
        switch (level) {
            case 'State':
                newState = { ...newState, currentLevel: 'State', selectedState: name, selectedDistrict: null, selectedPincode: null };
                break;
            case 'District':
                newState = { ...newState, currentLevel: 'District', selectedDistrict: name, selectedPincode: null };
                break;
            case 'Pincode':
                newState = { ...newState, currentLevel: 'Pincode', selectedPincode: name };
                break;
            default:
                // No change to newState if level is not recognized
                break;
        }
        return applyFilters(newState);
    }),

    drillUp: () => set((state) => {
        let newState = { ...state };
        if (state.selectedPincode) newState = { ...newState, currentLevel: 'District', selectedPincode: null };
        else if (state.selectedDistrict) newState = { ...newState, currentLevel: 'State', selectedDistrict: null };
        else if (state.selectedState) newState = { ...newState, currentLevel: 'National', selectedState: null };
        // If no drill-up possible, newState remains unchanged, and applyFilters will just re-apply current filters.
        return applyFilters(newState);
    }),

    resetFilters: () => set((state) => {
        const newState: AppState = {
            ...state,
            currentLevel: 'National',
            selectedState: null,
            selectedDistrict: null,
            selectedPincode: null,
            dateRange: { start: null, end: null },
            ageGroup: 'Total',
            populationRange: [0, 10000000],
        };
        return applyFilters(newState);
    }),
}));
