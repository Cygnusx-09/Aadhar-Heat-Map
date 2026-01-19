import { DemographicRecord } from '../types';

export type AnomalySeverity = 'Critical' | 'Warning' | 'Info';

export interface Anomaly {
    id: string;
    type: AnomalySeverity;
    title: string;
    description: string;
    district: string;
    state: string;
    metric: string;
    value: number;
    score: number; // Z-Score or magnitude of deviation
}

// Stats helper
const calculateStats = (values: number[]) => {
    const n = values.length;
    if (n === 0) return { mean: 0, stdDev: 0 };

    const mean = values.reduce((a, b) => a + b, 0) / n;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    return { mean, stdDev: Math.sqrt(variance) };
};

export const detectAnomalies = (records: DemographicRecord[]): Anomaly[] => {
    const anomalies: Anomaly[] = [];

    // Group records by district (summing up if needed, similar to analytics)
    // For anomaly detection, we usually want to check the *latest* aggregated state of a district.
    const districtMap = new Map<string, DemographicRecord>();
    records.forEach(r => {
        // Simple override for now, assuming unique rows per district per file or we just take one.
        // Better: Validate broadly across the dataset.
        const key = `${r.district}-${r.state}`;
        districtMap.set(key, r);
    });

    const uniqueRecords = Array.from(districtMap.values());
    if (uniqueRecords.length < 5) return []; // Need distinct data points for stats to make sense

    // 1. Zero Population (Data Quality)
    uniqueRecords.forEach(r => {
        if (r.total_population === 0) {
            anomalies.push({
                id: `zero-pop-${r.district}`,
                type: 'Critical',
                title: 'Zero Population Detected',
                description: `District reported 0 total population. Likely data entry error.`,
                district: r.district,
                state: r.state,
                metric: 'total_population',
                value: 0,
                score: 10
            });
        }
    });

    // 2. Statistical Outliers (Z-Score)
    // Let's look at Youth Enrollment (5-17 demo vs 5-17 enrol) if available
    // Or just look at demographic skew.

    // Check: Enrollment Rate (if both fields exist)
    const enrollmentRates: { record: DemographicRecord, rate: number }[] = [];
    uniqueRecords.forEach(r => {
        if (r.demo_age_5_17 && r.enrol_age_5_17) {
            const rate = (r.enrol_age_5_17 / r.demo_age_5_17) * 100;
            if (isFinite(rate)) enrollmentRates.push({ record: r, rate });
        }
    });

    if (enrollmentRates.length > 5) {
        const rates = enrollmentRates.map(x => x.rate);
        const { mean, stdDev } = calculateStats(rates);

        enrollmentRates.forEach(({ record, rate }) => {
            const zScore = (rate - mean) / stdDev;

            // Low Enrollment Anomaly (e.g. Z < -2)
            if (zScore < -2) {
                anomalies.push({
                    id: `low-enrol-${record.district}`,
                    type: 'Warning',
                    title: 'Low Youth Enrollment',
                    description: `Enrollment rate (${rate.toFixed(1)}%) is significantly below average (${mean.toFixed(1)}%).`,
                    district: record.district,
                    state: record.state,
                    metric: 'enrolment_rate',
                    value: rate,
                    score: Math.abs(zScore)
                });
            }

            // Suspiciously High Enrollment (> 100% or Z > 3)
            if (rate > 100 || zScore > 3) {
                anomalies.push({
                    id: `high-enrol-${record.district}`,
                    type: 'Info',
                    title: 'Suspicious Enrollment Data',
                    description: `Enrollment rate (${rate.toFixed(1)}%) exceeds expected logical bounds.`,
                    district: record.district,
                    state: record.state,
                    metric: 'enrolment_rate',
                    value: rate,
                    score: Math.abs(zScore)
                });
            }
        });
    }

    // 3. Gender/Demographic Skew (hypothetical if we had gender)
    // Let's check Age Distribution Skew: Very low 0-5 population relative to total
    const age05Ratios = uniqueRecords.map(r => ({ record: r, ratio: (r.demo_age_0_5 || 0) / r.total_population }));
    const ratioStats = calculateStats(age05Ratios.map(x => x.ratio));

    age05Ratios.forEach(({ record, ratio }) => {
        const zScore = (ratio - ratioStats.mean) / ratioStats.stdDev;
        if (zScore < -2.5) {
            anomalies.push({
                id: `low-birth-${record.district}`,
                type: 'Info',
                title: 'Low 0-5 Age Group',
                description: `0-5 age group proportion is statistically lower than peers.`,
                district: record.district,
                state: record.state,
                metric: 'age_0_5_ratio',
                value: ratio,
                score: Math.abs(zScore)
            });
        }
    });

    return anomalies.sort((a, b) => b.score - a.score); // Prioritize highest deviation
};
