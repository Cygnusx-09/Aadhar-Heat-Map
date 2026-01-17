import { DemographicRecord } from '../types';
import { parseISO, format, startOfWeek, startOfMonth, differenceInDays, parse } from 'date-fns';

export type TimeGranularity = 'daily' | 'weekly' | 'monthly';

export interface ActivityDataPoint {
    date: string; // Formatted date string
    timestamp: number; // For sorting
    demographic_activity: number;
    biometric_activity: number;
    enrollment_activity: number;
    total_activity: number;
    // Age group breakdowns
    demo_5_17: number;
    demo_17_plus: number;
    bio_5_17: number;
    bio_17_plus: number;
    enrol_0_5: number;
    enrol_5_17: number;
    enrol_18_plus: number;
}

export interface TrendIndicator {
    value: number;
    change: number; // Absolute change
    percentChange: number; // Percentage change
    direction: 'up' | 'down' | 'stable';
    label: string; // "↑ +15%", "↓ -8%", "→ Stable"
}

/**
 * Parse DD-MM-YYYY date format to Date object
 */
const parseDate = (dateStr: string): Date | null => {
    try {
        const parts = dateStr.split('-');
        if (parts.length !== 3) return null;
        // DD-MM-YYYY -> new Date(year, month-1, day)
        return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } catch {
        return null;
    }
};

/**
 * Aggregate Aadhaar activity data by time period
 */
export const aggregateActivityByTime = (
    records: DemographicRecord[],
    granularity: TimeGranularity = 'daily'
): ActivityDataPoint[] => {
    const aggregationMap = new Map<string, ActivityDataPoint>();

    records.forEach(record => {
        const date = parseDate(record.date);
        if (!date) return;

        let key: string;
        let formattedDate: string;

        switch (granularity) {
            case 'weekly':
                const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
                key = format(weekStart, 'yyyy-MM-dd');
                formattedDate = format(weekStart, 'MMM dd, yyyy');
                break;
            case 'monthly':
                const monthStart = startOfMonth(date);
                key = format(monthStart, 'yyyy-MM-dd');
                formattedDate = format(monthStart, 'MMM yyyy');
                break;
            case 'daily':
            default:
                key = format(date, 'yyyy-MM-dd');
                formattedDate = format(date, 'MMM dd, yyyy');
                break;
        }

        if (!aggregationMap.has(key)) {
            aggregationMap.set(key, {
                date: formattedDate,
                timestamp: date.getTime(),
                demographic_activity: 0,
                biometric_activity: 0,
                enrollment_activity: 0,
                total_activity: 0,
                // Age group breakdowns
                demo_5_17: 0,
                demo_17_plus: 0,
                bio_5_17: 0,
                bio_17_plus: 0,
                enrol_0_5: 0,
                enrol_5_17: 0,
                enrol_18_plus: 0
            });
        }

        const dataPoint = aggregationMap.get(key)! as any;

        // Identify file type by checking which specific fields are present
        // Priority: Check specific fields first (bio_*, enrol_*) before falling back to generic demo_*

        if (record.bio_age_5_17 !== undefined && record.bio_age_5_17 !== null) {
            // Biometric file
            const bio_5_17 = record.bio_age_5_17 || 0;
            const bio_17_plus = record.bio_age_17_ || 0;

            dataPoint.biometric_activity += bio_5_17 + bio_17_plus;
            dataPoint.bio_5_17 += bio_5_17;
            dataPoint.bio_17_plus += bio_17_plus;

        } else if (record.enrol_age_0_5 !== undefined || record.enrol_age_5_17 !== undefined) {
            // Enrollment file
            const enrol_0_5 = record.enrol_age_0_5 || 0;
            const enrol_5_17 = record.enrol_age_5_17 || 0;
            const enrol_18_plus = record.enrol_age_18_ || 0;

            dataPoint.enrollment_activity += enrol_0_5 + enrol_5_17 + enrol_18_plus;
            dataPoint.enrol_0_5 += enrol_0_5;
            dataPoint.enrol_5_17 += enrol_5_17;
            dataPoint.enrol_18_plus += enrol_18_plus;

        } else {
            // Demographic file (only has generic demo_* fields, no specific bio_ or enrol_)
            const demo_5_17 = record.demo_age_5_17 || 0;
            const demo_17_plus = record.demo_age_17_ || 0;

            dataPoint.demographic_activity += demo_5_17 + demo_17_plus;
            dataPoint.demo_5_17 += demo_5_17;
            dataPoint.demo_17_plus += demo_17_plus;
        }

        dataPoint.total_activity =
            dataPoint.demographic_activity +
            dataPoint.biometric_activity +
            dataPoint.enrollment_activity;
    });

    // Convert to array and sort by timestamp
    return Array.from(aggregationMap.values()).sort((a, b) => a.timestamp - b.timestamp);
};

/**
 * Calculate growth rate between two values
 */
const calculateGrowth = (current: number, previous: number): TrendIndicator => {
    const change = current - previous;
    const percentChange = previous === 0 ? 0 : (change / previous) * 100;

    let direction: 'up' | 'down' | 'stable' = 'stable';
    if (Math.abs(percentChange) < 1) {
        direction = 'stable';
    } else if (percentChange > 0) {
        direction = 'up';
    } else {
        direction = 'down';
    }

    const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
    const label = direction === 'stable'
        ? '→ Stable'
        : `${arrow} ${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

    return {
        value: current,
        change,
        percentChange,
        direction,
        label
    };
};

/**
 * Calculate Week-over-Week growth
 */
export const calculateWoWGrowth = (data: ActivityDataPoint[]): TrendIndicator => {
    if (data.length < 2) {
        return { value: 0, change: 0, percentChange: 0, direction: 'stable', label: '→ N/A' };
    }

    const current = data[data.length - 1].total_activity;
    const previous = data[data.length - 2].total_activity;

    return calculateGrowth(current, previous);
};

/**
 * Calculate Month-over-Month growth
 */
export const calculateMoMGrowth = (monthlyData: ActivityDataPoint[]): TrendIndicator => {
    if (monthlyData.length < 2) {
        return { value: 0, change: 0, percentChange: 0, direction: 'stable', label: '→ N/A' };
    }

    const current = monthlyData[monthlyData.length - 1].total_activity;
    const previous = monthlyData[monthlyData.length - 2].total_activity;

    return calculateGrowth(current, previous);
};

/**
 * Detect activity patterns (day-of-week analysis)
 */
export const getDayOfWeekPattern = (records: DemographicRecord[]): { day: string; avgActivity: number }[] => {
    const dayMap = new Map<number, number[]>();

    records.forEach(record => {
        const date = parseDate(record.date);
        if (!date) return;

        const dayOfWeek = date.getDay(); // 0=Sunday, 6=Saturday
        if (!dayMap.has(dayOfWeek)) {
            dayMap.set(dayOfWeek, []);
        }

        dayMap.get(dayOfWeek)!.push(record.total_population);
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result: { day: string; avgActivity: number }[] = [];

    dayMap.forEach((values, dayNum) => {
        const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
        result.push({
            day: dayNames[dayNum],
            avgActivity: Math.round(avg)
        });
    });

    return result.sort((a, b) => dayNames.indexOf(a.day) - dayNames.indexOf(b.day));
};

/**
 * Calculate moving average for smoothing
 */
export const calculateMovingAverage = (data: ActivityDataPoint[], windowSize: number = 7): ActivityDataPoint[] => {
    if (data.length < windowSize) return data;

    const result: ActivityDataPoint[] = [];

    for (let i = 0; i < data.length; i++) {
        if (i < windowSize - 1) {
            result.push(data[i]);
            continue;
        }

        const window = data.slice(i - windowSize + 1, i + 1);
        const avgTotal = window.reduce((sum, d) => sum + d.total_activity, 0) / windowSize;
        const avgDemo = window.reduce((sum, d) => sum + d.demographic_activity, 0) / windowSize;
        const avgBio = window.reduce((sum, d) => sum + d.biometric_activity, 0) / windowSize;
        const avgEnrol = window.reduce((sum, d) => sum + d.enrollment_activity, 0) / windowSize;

        result.push({
            ...data[i],
            total_activity: Math.round(avgTotal),
            demographic_activity: Math.round(avgDemo),
            biometric_activity: Math.round(avgBio),
            enrollment_activity: Math.round(avgEnrol)
        });
    }

    return result;
};
