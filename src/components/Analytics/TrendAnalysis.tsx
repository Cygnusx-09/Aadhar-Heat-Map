import React, { useMemo, useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import {
    aggregateActivityByTime,
    calculateWoWGrowth,
    calculateMoMGrowth,
    calculateMovingAverage,
    getDayOfWeekPattern,
    TimeGranularity,
    ActivityDataPoint
} from '../../utils/trends';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3, Loader2 } from 'lucide-react';

export const TrendAnalysis: React.FC = () => {
    const { rawRecords, uploadedFiles } = useStore();
    const [granularity, setGranularity] = useState<TimeGranularity>('daily');
    const [showMovingAvg, setShowMovingAvg] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Age group visibility toggles
    const [visibleLines, setVisibleLines] = useState({
        demo_5_17: true,
        demo_17_plus: true,
        bio_5_17: true,
        bio_17_plus: true,
        enrol_0_5: true,
        enrol_5_17: true,
        enrol_18_plus: true,
        total: true
    });

    // Limit data for performance - use stratified sampling to include all file types
    const limitedRecords = useMemo(() => {
        const MAX_RECORDS = 200000; // Supports ~15 files with ~500k records each

        if (rawRecords.length <= MAX_RECORDS) {
            return rawRecords;
        }

        console.warn(`Large dataset detected (${rawRecords.length} records). Using stratified sampling to ${MAX_RECORDS.toLocaleString()} for performance.`);

        // Group records by fileId to ensure proportional sampling from each file
        const recordsByFile = new Map<string, typeof rawRecords>();
        rawRecords.forEach(record => {
            const fileId = record.fileId || 'unknown';
            if (!recordsByFile.has(fileId)) {
                recordsByFile.set(fileId, []);
            }
            recordsByFile.get(fileId)!.push(record);
        });

        // Calculate proportional sample size for each file
        const sampledRecords: typeof rawRecords = [];
        const fileCount = recordsByFile.size;

        recordsByFile.forEach((records, fileId) => {
            // Calculate this file's proportional share
            const proportion = records.length / rawRecords.length;
            const sampleSize = Math.max(
                Math.floor(MAX_RECORDS * proportion),
                Math.min(records.length, Math.floor(MAX_RECORDS / fileCount)) // Ensure minimum representation
            );

            // Take evenly distributed samples from this file
            const step = Math.max(1, Math.floor(records.length / sampleSize));
            for (let i = 0; i < records.length && sampledRecords.length < MAX_RECORDS; i += step) {
                sampledRecords.push(records[i]);
            }
        });

        console.log(`Stratified sampling: ${fileCount} files, ${sampledRecords.length} total records sampled`);
        return sampledRecords;
    }, [rawRecords]);


    // Aggregate data by selected time period with async processing
    const [activityData, setActivityData] = useState<ActivityDataPoint[]>([]);
    const [weeklyData, setWeeklyData] = useState<ActivityDataPoint[]>([]);
    const [monthlyData, setMonthlyData] = useState<ActivityDataPoint[]>([]);

    useEffect(() => {
        setIsLoading(true);

        // Use setTimeout to prevent UI blocking
        setTimeout(() => {
            try {
                const daily = aggregateActivityByTime(limitedRecords, granularity);
                const weekly = aggregateActivityByTime(limitedRecords, 'weekly');
                const monthly = aggregateActivityByTime(limitedRecords, 'monthly');

                setActivityData(daily);
                setWeeklyData(weekly);
                setMonthlyData(monthly);
            } catch (error) {
                console.error('Error processing trend data:', error);
            } finally {
                setIsLoading(false);
            }
        }, 0);
    }, [limitedRecords, granularity]);

    // Apply moving average if enabled
    const displayData = useMemo(() => {
        return showMovingAvg ? calculateMovingAverage(activityData, 7) : activityData;
    }, [activityData, showMovingAvg]);

    // Calculate growth indicators
    const wowGrowth = useMemo(() => calculateWoWGrowth(weeklyData), [weeklyData]);
    const momGrowth = useMemo(() => calculateMoMGrowth(monthlyData), [monthlyData]);

    // Day of week pattern
    const dayPattern = useMemo(() => getDayOfWeekPattern(limitedRecords), [limitedRecords]);

    // Calculate global date range from all uploaded files
    const globalDateRange = useMemo((): { earliest: Date; latest: Date } | null => {
        if (uploadedFiles.length === 0) return null;

        const parseDate = (dateStr: string) => {
            const [day, month, year] = dateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
        };

        let earliest: Date | null = null;
        let latest: Date | null = null;

        uploadedFiles.forEach(file => {
            if (file.dateRange) {
                const e = parseDate(file.dateRange.earliest);
                const l = parseDate(file.dateRange.latest);
                if (!earliest || e < earliest) earliest = e;
                if (!latest || l > latest) latest = l;
            }
        });

        if (earliest && latest) {
            return { earliest, latest };
        }
        return null;
    }, [uploadedFiles]);

    // Count files by type
    const fileCountsByType = useMemo(() => ({
        demographic: uploadedFiles.filter(f => f.fileType === 'demographic').length,
        biometric: uploadedFiles.filter(f => f.fileType === 'biometric').length,
        enrollment: uploadedFiles.filter(f => f.fileType === 'enrollment').length
    }), [uploadedFiles]);

    // Latest activity totals
    const latestActivity = activityData.length > 0 ? activityData[activityData.length - 1] : null;

    const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
        switch (direction) {
            case 'up': return <TrendingUp className="w-5 h-5 text-green-500" />;
            case 'down': return <TrendingDown className="w-5 h-5 text-red-500" />;
            case 'stable': return <Minus className="w-5 h-5 text-yellow-500" />;
        }
    };

    if (rawRecords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50 p-12">
                <Calendar className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-sm">No data available for trend analysis. Upload CSV files to begin.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50 p-12">
                <Loader2 className="w-12 h-12 mb-4 animate-spin text-accent-blue" />
                <p className="text-sm">Processing activity trends...</p>
                <p className="text-xs text-white/30 mt-2">Analyzing {limitedRecords.length.toLocaleString()} records</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 h-full overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex justify-between items-end border-b border-white/10 pb-4">
                <div>
                    <h2 className="text-2xl font-mono uppercase tracking-widest text-white">Activity Trend Analysis</h2>
                    <div className="flex items-center gap-4 mt-1">
                        {globalDateRange && (
                            <p className="text-xs text-white/50 font-mono">
                                {globalDateRange.earliest.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                {' → '}
                                {globalDateRange.latest.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </p>
                        )}
                        <div className="flex gap-2 text-[10px] font-mono">
                            {fileCountsByType.demographic > 0 && (
                                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded">
                                    {fileCountsByType.demographic} DEMO
                                </span>
                            )}
                            {fileCountsByType.biometric > 0 && (
                                <span className="px-1.5 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded">
                                    {fileCountsByType.biometric} BIO
                                </span>
                            )}
                            {fileCountsByType.enrollment > 0 && (
                                <span className="px-1.5 py-0.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded">
                                    {fileCountsByType.enrollment} ENROL
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Granularity Controls */}
                <div className="flex items-center gap-2">
                    <div className="flex bg-black/40 border border-white/10 rounded-sm overflow-hidden">
                        <button
                            onClick={() => setGranularity('daily')}
                            className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors ${granularity === 'daily' ? 'bg-accent-blue text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            Daily
                        </button>
                        <button
                            onClick={() => setGranularity('weekly')}
                            className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors border-l border-white/10 ${granularity === 'weekly' ? 'bg-accent-blue text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            Weekly
                        </button>
                        <button
                            onClick={() => setGranularity('monthly')}
                            className={`px-3 py-1.5 text-xs font-mono uppercase transition-colors border-l border-white/10 ${granularity === 'monthly' ? 'bg-accent-blue text-white' : 'text-white/50 hover:text-white'}`}
                        >
                            Monthly
                        </button>
                    </div>

                    <label className="flex items-center gap-2 text-xs text-white/60 font-mono cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showMovingAvg}
                            onChange={(e) => setShowMovingAvg(e.target.checked)}
                            className="rounded"
                        />
                        7-Day MA
                    </label>
                </div>
            </div>

            {/* Growth Indicators */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Week-over-Week */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-white/40 font-mono">Week-over-Week Growth</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                {getTrendIcon(wowGrowth.direction)}
                                <span className="text-2xl font-bold text-white">{wowGrowth.label}</span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                {wowGrowth.change > 0 ? '+' : ''}{wowGrowth.change.toLocaleString()} activities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Month-over-Month */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-white/40 font-mono">Month-over-Month Growth</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                {getTrendIcon(momGrowth.direction)}
                                <span className="text-2xl font-bold text-white">{momGrowth.label}</span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                {momGrowth.change > 0 ? '+' : ''}{momGrowth.change.toLocaleString()} activities
                            </p>
                        </div>
                    </div>
                </div>

                {/* Latest Activity */}
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 relative overflow-hidden">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs uppercase tracking-wider text-white/40 font-mono">Latest Period Activity</p>
                            <div className="flex items-baseline gap-2 mt-2">
                                <BarChart3 className="w-5 h-5 text-accent-blue" />
                                <span className="text-2xl font-bold text-white">
                                    {latestActivity?.total_activity.toLocaleString() || '0'}
                                </span>
                            </div>
                            <p className="text-xs text-white/50 mt-1">
                                {latestActivity?.date || 'No data'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Three Separate Charts - One for each data type */}

            {/* 1. Demographic Activity Chart */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm uppercase tracking-wider text-white/60 font-mono">Demographic Updates Activity</h3>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#3b82f6]"></span>
                            Age 5-17
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#60a5fa]"></span>
                            Age 17+
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-0.5 bg-[#8b5cf6]"></span>
                            Total
                        </span>
                    </div>
                </div>

                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                scale="time"
                                domain={['dataMin', 'dataMax']}
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            />

                            {/* Demographic Lines Only */}
                            <Line
                                type="monotone"
                                dataKey="demo_5_17"
                                stroke="#3b82f6"
                                name="Demo 5-17"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="demo_17_plus"
                                stroke="#60a5fa"
                                name="Demo 17+"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="demographic_activity"
                                stroke="#8b5cf6"
                                name="Total Demographic"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Biometric Activity Chart */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm uppercase tracking-wider text-white/60 font-mono">Biometric Updates Activity</h3>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#f59e0b]"></span>
                            Age 5-17
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#fbbf24]"></span>
                            Age 17+
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-0.5 bg-[#fb923c]"></span>
                            Total
                        </span>
                    </div>
                </div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                scale="time"
                                domain={['dataMin', 'dataMax']}
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="bio_5_17"
                                stroke="#f59e0b"
                                name="Bio 5-17"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="bio_17_plus"
                                stroke="#fbbf24"
                                name="Bio 17+"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="biometric_activity"
                                stroke="#fb923c"
                                name="Total Biometric"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Enrollment Activity Chart */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm uppercase tracking-wider text-white/60 font-mono">New Enrollment Activity</h3>
                    <div className="flex gap-2 text-xs">
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#10b981]"></span>
                            Age 0-5
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#34d399]"></span>
                            Age 5-17
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-0.5 bg-[#6ee7b7]"></span>
                            Age 18+
                        </span>
                        <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-0.5 bg-[#059669]"></span>
                            Total
                        </span>
                    </div>
                </div>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="timestamp"
                                type="number"
                                scale="time"
                                domain={['dataMin', 'dataMax']}
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                                interval="preserveStartEnd"
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(0,0,0,0.9)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    borderRadius: '4px',
                                    fontSize: '12px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="enrol_0_5"
                                stroke="#10b981"
                                name="Enrol 0-5"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="enrol_5_17"
                                stroke="#34d399"
                                name="Enrol 5-17"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="enrol_18_plus"
                                stroke="#6ee7b7"
                                name="Enrol 18+"
                                strokeWidth={2}
                                dot={false}
                            />
                            <Line
                                type="monotone"
                                dataKey="enrollment_activity"
                                stroke="#059669"
                                name="Total Enrollment"
                                strokeWidth={3}
                                dot={false}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Day of Week Pattern */}
            {dayPattern.length > 0 && (
                <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                    <h3 className="text-sm uppercase tracking-wider text-white/60 font-mono mb-4">Activity by Day of Week</h3>
                    <div className="grid grid-cols-7 gap-2">
                        {dayPattern.map((day) => {
                            const maxActivity = Math.max(...dayPattern.map(d => d.avgActivity));
                            const heightPercent = (day.avgActivity / maxActivity) * 100;

                            return (
                                <div key={day.day} className="flex flex-col items-center">
                                    <div className="w-full h-32 relative flex items-end justify-center bg-black/30 border border-white/5 rounded-sm">
                                        <div
                                            className="w-full bg-accent-blue/60 transition-all duration-300 hover:bg-accent-blue rounded-sm"
                                            style={{ height: `${heightPercent}%` }}
                                            title={`${day.avgActivity.toLocaleString()} avg activities`}
                                        />
                                    </div>
                                    <p className="text-xs text-white/50 mt-2 font-mono">{day.day.slice(0, 3)}</p>
                                    <p className="text-[10px] text-white/30 font-mono">{day.avgActivity.toLocaleString()}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
