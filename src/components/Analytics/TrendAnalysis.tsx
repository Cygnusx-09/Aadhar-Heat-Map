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
    const { rawRecords } = useStore();
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

    // Limit data for performance - process max 50k records
    const limitedRecords = useMemo(() => {
        if (rawRecords.length > 50000) {
            console.warn(`Large dataset detected (${rawRecords.length} records). Sampling to 50k for performance.`);
            return rawRecords.slice(0, 50000);
        }
        return rawRecords;
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
                    <p className="text-xs text-white/50 font-mono mt-1">
                        Enrollment & Update Activity Over Time
                    </p>
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
                                dataKey="date"
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin', 'dataMax']}
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

                            {/* Demographic Lines */}
                            {visibleLines.demo_5_17 && (
                                <Line
                                    type="monotone"
                                    dataKey="demo_5_17"
                                    stroke="#3b82f6"
                                    name="Demo 5-17"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            {visibleLines.demo_17_plus && (
                                <Line
                                    type="monotone"
                                    dataKey="demo_17_plus"
                                    stroke="#60a5fa"
                                    name="Demo 17+"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}

                            {/* Biometric Lines */}
                            {visibleLines.bio_5_17 && (
                                <Line
                                    type="monotone"
                                    dataKey="bio_5_17"
                                    stroke="#f59e0b"
                                    name="Bio 5-17"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            {visibleLines.bio_17_plus && (
                                <Line
                                    type="monotone"
                                    dataKey="bio_17_plus"
                                    stroke="#fbbf24"
                                    name="Bio 17+"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}

                            {/* Enrollment Lines */}
                            {visibleLines.enrol_0_5 && (
                                <Line
                                    type="monotone"
                                    dataKey="enrol_0_5"
                                    stroke="#10b981"
                                    name="Enrol 0-5"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            {visibleLines.enrol_5_17 && (
                                <Line
                                    type="monotone"
                                    dataKey="enrol_5_17"
                                    stroke="#34d399"
                                    name="Enrol 5-17"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}
                            {visibleLines.enrol_18_plus && (
                                <Line
                                    type="monotone"
                                    dataKey="enrol_18_plus"
                                    stroke="#6ee7b7"
                                    name="Enrol 18+"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            )}

                            {/* Total Line */}
                            {visibleLines.total && (
                                <Line
                                    type="monotone"
                                    dataKey="total_activity"
                                    stroke="#ffffff"
                                    name="Total Activity"
                                    strokeWidth={3}
                                    dot={false}
                                />
                            )}
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
                                dataKey="date"
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin', 'dataMax']}
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
                                dataKey="date"
                                stroke="#666"
                                tick={{ fill: '#666', fontSize: 10 }}
                                tickLine={false}
                                axisLine={false}
                                domain={['dataMin', 'dataMax']}
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
