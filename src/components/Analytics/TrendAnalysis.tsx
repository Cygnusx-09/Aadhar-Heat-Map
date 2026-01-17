import React, { useMemo, useState } from 'react';
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
import { TrendingUp, TrendingDown, Minus, Calendar, BarChart3 } from 'lucide-react';

export const TrendAnalysis: React.FC = () => {
    const { rawRecords } = useStore();
    const [granularity, setGranularity] = useState<TimeGranularity>('daily');
    const [showMovingAvg, setShowMovingAvg] = useState(false);

    // Aggregate data by selected time period
    const activityData = useMemo(() => aggregateActivityByTime(rawRecords, granularity), [rawRecords, granularity]);

    // Apply moving average if enabled
    const displayData = useMemo(() => {
        return showMovingAvg ? calculateMovingAverage(activityData, 7) : activityData;
    }, [activityData, showMovingAvg]);

    // Calculate growth indicators
    const weeklyData = useMemo(() => aggregateActivityByTime(rawRecords, 'weekly'), [rawRecords]);
    const monthlyData = useMemo(() => aggregateActivityByTime(rawRecords, 'monthly'), [rawRecords]);

    const wowGrowth = useMemo(() => calculateWoWGrowth(weeklyData), [weeklyData]);
    const momGrowth = useMemo(() => calculateMoMGrowth(monthlyData), [monthlyData]);

    // Day of week pattern
    const dayPattern = useMemo(() => getDayOfWeekPattern(rawRecords), [rawRecords]);

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

            {/* Activity Over Time Chart */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-6 h-[400px]">
                <h3 className="text-sm uppercase tracking-wider text-white/60 font-mono mb-4">Activity Volume Over Time</h3>
                <ResponsiveContainer width="100%" height="90%">
                    <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis
                            dataKey="date"
                            stroke="#666"
                            tick={{ fill: '#666', fontSize: 10 }}
                            tickLine={false}
                            axisLine={false}
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
                        <Legend
                            wrapperStyle={{ fontSize: '11px' }}
                            iconType="line"
                        />
                        <Line
                            type="monotone"
                            dataKey="demographic_activity"
                            stroke="#3b82f6"
                            name="Demographic Updates"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="biometric_activity"
                            stroke="#f59e0b"
                            name="Biometric Updates"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="enrollment_activity"
                            stroke="#10b981"
                            name="New Enrollments"
                            strokeWidth={2}
                            dot={false}
                        />
                        <Line
                            type="monotone"
                            dataKey="total_activity"
                            stroke="#ffffff"
                            name="Total Activity"
                            strokeWidth={3}
                            dot={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
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
