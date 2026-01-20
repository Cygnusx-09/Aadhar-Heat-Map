
import { DemographicRecord } from '../types';

export interface AnalyticsRow {
    district: string;
    state: string;
    // Aggregated Metrics
    demo_5_17: number;
    demo_17_plus: number;
    bio_5_17: number;
    bio_17_plus: number;
    enrol_0_5: number;
    enrol_5_17: number;
    enrol_18_plus: number;
}

export type CorrelationMatrix = Record<string, Record<string, number>>;

/**
 * Joins raw records into a unified dataset grouped by District.
 * It sums up values if multiple records exist for the same district (e.g. over time).
 */
export const joinDatasets = (records: DemographicRecord[]): AnalyticsRow[] => {
    const map = new Map<string, AnalyticsRow>();

    records.forEach(r => {
        // Create a unique key for the district
        const key = `${r.state}-${r.district}`.toLowerCase();

        if (!map.has(key)) {
            map.set(key, {
                district: r.district,
                state: r.state,
                demo_5_17: 0,
                demo_17_plus: 0,
                bio_5_17: 0,
                bio_17_plus: 0,
                enrol_0_5: 0,
                enrol_5_17: 0,
                enrol_18_plus: 0
            });
        }

        const entry = map.get(key)!;

        // Populate fields based on their presence.
        // Note: Generic demo_age_* fields in 'r' are used for the main dashboard,
        // but for analytics we rely on the specific optional fields we added.

        // Demographic File Data (Inferred if specific bio/enrol are missing but generic values exist, OR rely on file tagging if implemented)
        // Since we explicitly populated `bio_age_...` and `enrol_age_...` in CSVUpload, we check those.

        if (r.bio_age_5_17 !== undefined) {
            entry.bio_5_17 += r.bio_age_5_17 || 0;
            entry.bio_17_plus += r.bio_age_17_ || 0;
        } else if (r.enrol_age_0_5 !== undefined) {
            entry.enrol_0_5 += r.enrol_age_0_5 || 0;
            entry.enrol_5_17 += r.enrol_age_5_17 || 0;
            entry.enrol_18_plus += r.enrol_age_18_ || 0;
        } else {
            // Fallback: Assume it's a Demographic file if it lacks Bio/Enrol tags
            entry.demo_5_17 += r.demo_age_5_17 || 0;
            entry.demo_17_plus += r.demo_age_17_ || 0;
        }
    });

    return Array.from(map.values());
};

/**
 * Calculates Pearson Correlation Coefficient (r) between two arrays.
 * Returns value between -1 and 1.
 */
export const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length;
    if (n !== y.length || n === 0) return 0;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    if (denominator === 0) return 0;
    return numerator / denominator;
};

/**
 * Generates a full correlation matrix for all numeric metrics in the dataset.
 */
export const calculateCorrelationMatrix = (data: AnalyticsRow[]): CorrelationMatrix => {
    const metrics: (keyof AnalyticsRow)[] = [
        'demo_5_17', 'demo_17_plus',
        'bio_5_17', 'bio_17_plus',
        'enrol_0_5', 'enrol_5_17', 'enrol_18_plus'
    ];

    const matrix: CorrelationMatrix = {};

    metrics.forEach(m1 => {
        matrix[m1] = {};
        metrics.forEach(m2 => {
            const x = data.map(row => row[m1] as number);
            const y = data.map(row => row[m2] as number);
            matrix[m1][m2] = calculateCorrelation(x, y);
        });
    });

    return matrix;
};
