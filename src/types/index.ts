export interface UploadedFile {
    id: string;
    name: string;
    size: number;
    recordCount: number;
}

export interface DemographicRecord {
    fileId?: string; // Track origin
    date: string; // DD-MM-YYYY
    state: string;
    district: string;
    pincode: string;
    demo_age_0_5?: number;
    demo_age_5_17: number;
    demo_age_17_: number;

    // Biometric Specific
    bio_age_5_17?: number;
    bio_age_17_?: number;

    // Enrolment Specific
    enrol_age_0_5?: number;
    enrol_age_5_17?: number;
    enrol_age_18_?: number;

    total_population: number;
    lat?: number; // Latitude
    lng?: number; // Longitude
}

export interface AggregatedData {
    name: string;
    total_5_17: number;
    total_17_plus: number;
    total: number;
    count: number;
}

export type GeographicLevel = 'National' | 'State' | 'District' | 'Pincode';

export interface AppState {
    // Data
    rawRecords: DemographicRecord[];
    filteredRecords: DemographicRecord[];
    uploadedFiles: UploadedFile[];

    // Selection/Filtering
    currentLevel: GeographicLevel;
    selectedState: string | null;
    selectedDistrict: string | null;
    selectedPincode: string | null;

    dateRange: {
        start: Date | null;
        end: Date | null;
    };

    ageGroup: '5-17' | '17+' | 'Total';
    populationRange: [number, number];

    // UI State
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;

    // Actions
    init: () => Promise<void>;
    addRawData: (data: DemographicRecord[], file: UploadedFile) => void;
    removeFile: (fileId: string) => void;
    setFilters: (filters: Partial<AppState>) => void;
    setAgeGroup: (group: '5-17' | '17+' | 'Total') => void;
    drillDown: (level: GeographicLevel, name: string) => void;
    drillUp: () => void;
    resetFilters: () => void;
}
