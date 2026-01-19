import { create } from 'zustand';
import { AppState, DemographicRecord, GeographicLevel } from '../types';
import { dbOperations } from '../lib/db';

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

export const useStore = create<AppState>((set, get) => ({
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
    isInitialized: false,
    error: null,

    init: async () => {
        set({ isLoading: true });
        try {
            const datasets = await dbOperations.getAllDatasets();
            let allRecords: DemographicRecord[] = [];
            const files = datasets.map(d => {
                allRecords = [...allRecords, ...d.records];
                return d.fileInfo;
            });

            // Sort files by timestamp if possible, but datasets from idb generic getAll might not be ordered by time added.
            // That's fine for now.

            set(state => {
                const newState = {
                    ...state,
                    uploadedFiles: files,
                    rawRecords: allRecords,
                    isLoading: false,
                    isInitialized: true
                };
                return applyFilters(newState);
            });
        } catch (err) {
            console.error("Failed to init from DB", err);
            set({ isLoading: false, isInitialized: true, error: "Failed to restore data" });
        }
    },

    addRawData: (data, file) => {
        // optimistically update UI
        set((state) => {
            const newRecords = [...state.rawRecords, ...data];
            const newFiles = [...state.uploadedFiles, file];

            const newState = {
                ...state,
                rawRecords: newRecords,
                uploadedFiles: newFiles,
                isLoading: false,
                error: null
            };
            return applyFilters(newState);
        });

        // Persist to DB
        dbOperations.saveDataset(file, data).catch(err => {
            console.error("Failed to save to DB", err);
            // Optionally set error state here
        });
    },

    removeFile: (fileId) => {
        set((state) => {
            const newFiles = state.uploadedFiles.filter(f => f.id !== fileId);
            const newRecords = state.rawRecords.filter(r => r.fileId !== fileId);

            const newState = {
                ...state,
                uploadedFiles: newFiles,
                rawRecords: newRecords,
            };
            return applyFilters(newState);
        });

        // Remove from DB
        dbOperations.deleteDataset(fileId).catch(err => {
            console.error("Failed to delete from DB", err);
        });
    },

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
                break;
        }
        return applyFilters(newState);
    }),

    drillUp: () => set((state) => {
        let newState = { ...state };
        if (state.selectedPincode) newState = { ...newState, currentLevel: 'District', selectedPincode: null };
        else if (state.selectedDistrict) newState = { ...newState, currentLevel: 'State', selectedDistrict: null };
        else if (state.selectedState) newState = { ...newState, currentLevel: 'National', selectedState: null };
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
