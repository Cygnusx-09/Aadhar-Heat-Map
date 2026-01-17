
import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { joinDatasets, calculateCorrelationMatrix, AnalyticsRow } from '../../utils/analytics';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import { AlertCircle, TrendingUp, LineChart as LineChartIcon, Grid3x3 } from 'lucide-react';
import { TrendAnalysis } from './TrendAnalysis';

const METRIC_LABELS: Record<keyof Omit<AnalyticsRow, 'district' | 'state'>, string> = {
    demo_5_17: 'Demographic (5-17)',
    demo_17_plus: 'Demographic (17+)',
    bio_5_17: 'Biometric (5-17)',
    bio_17_plus: 'Biometric (17+)',
    enrol_0_5: 'Enrolment (0-5)',
    enrol_5_17: 'Enrolment (5-17)',
    enrol_18_plus: 'Enrolment (18+)'
};

const METRIC_KEYS = Object.keys(METRIC_LABELS) as (keyof typeof METRIC_LABELS)[];

export const AnalyticsDashboard: React.FC = () => {
    const { rawRecords } = useStore();
    const [activeTab, setActiveTab] = useState<'trends' | 'correlation'>('trends');

    // State for interactive scatter plot
    const [xMetric, setXMetric] = useState<keyof typeof METRIC_LABELS>('demo_5_17');
    const [yMetric, setYMetric] = useState<keyof typeof METRIC_LABELS>('bio_5_17');

    // 1. Prepare Data
    const data = useMemo(() => joinDatasets(rawRecords), [rawRecords]);

    // 2. Calculate Correlation Matrix
    const correlationMatrix = useMemo(() => calculateCorrelationMatrix(data), [data]);

    // 3. Find Insight (Max Correlation)
    const insight = useMemo(() => {
        let maxR = -1;
        let bestPair = { m1: '', m2: '' };

        METRIC_KEYS.forEach(m1 => {
            METRIC_KEYS.forEach(m2 => {
                if (m1 === m2) return;
                const r = correlationMatrix[m1][m2];
                if (Math.abs(r) > maxR) {
                    maxR = Math.abs(r);
                    bestPair = { m1, m2 };
                }
            });
        });

        return { maxR, ...bestPair };
    }, [correlationMatrix]);

    // Helper for Matrix Color
    const getCellColor = (value: number) => {
        // Red = Positive (1), Blue = Negative (-1), White = 0
        if (value > 0) return `rgba(239, 68, 68, ${value})`; // Red-500
        if (value < 0) return `rgba(59, 130, 246, ${Math.abs(value)})`; // Blue-500
        return 'rgba(255, 255, 255, 0.1)';
    };

    if (rawRecords.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-white/50">
                <AlertCircle className="w-12 h-12 mb-4" />
                <p>No data available for analysis. Upload CSV files to begin.</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header with Tabs */}
            <header className="border-b border-white/10 px-6 pt-6 pb-0">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-2xl font-mono uppercase tracking-widest text-white">Analytics</h1>
                        <p className="text-xs text-white/50 font-mono mt-1">
                            Advanced Insights & Trend Detection
                        </p>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab('trends')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase transition-colors border-b-2 ${activeTab === 'trends'
                                ? 'text-white border-accent-blue'
                                : 'text-white/50 border-transparent hover:text-white'
                            }`}
                    >
                        <LineChartIcon className="w-4 h-4" />
                        Trend Analysis
                    </button>
                    <button
                        onClick={() => setActiveTab('correlation')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-mono uppercase transition-colors border-b-2 ${activeTab === 'correlation'
                                ? 'text-white border-accent-blue'
                                : 'text-white/50 border-transparent hover:text-white'
                            }`}
                    >
                        <Grid3x3 className="w-4 h-4" />
                        Correlation Matrix
                    </button>
                </div>
            </header>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'trends' ? (
                    <TrendAnalysis />
                ) : (
                    <div className="h-full overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">
                        {/* Top Section: Insights & Matrix */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                            {/* Insight Card */}
                            <div className="lg:col-span-4 space-y-4">
                                <div className="bg-black/40 border border-white/10 rounded-lg p-6 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <TrendingUp className="w-24 h-24" />
                                    </div>
                                    <h3 className="text-accent-blue font-mono text-xs uppercase tracking-wider mb-2">Key Insight</h3>
                                    <p className="text-white text-lg font-light leading-relaxed">
                                        Strongest relationship found between <br />
                                        <span className="font-bold text-accent-red">{METRIC_LABELS[insight.m1 as keyof typeof METRIC_LABELS]}</span> and <br />
                                        <span className="font-bold text-accent-red">{METRIC_LABELS[insight.m2 as keyof typeof METRIC_LABELS]}</span>
                                    </p>
                                    <div className="mt-4 flex items-baseline gap-2">
                                        <span className="text-4xl font-bold text-white">{insight.maxR.toFixed(2)}</span>
                                        <span className="text-xs text-white/50 uppercase">Correlation Coeff (R)</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            setXMetric(insight.m1 as any);
                                            setYMetric(insight.m2 as any);
                                        }}
                                        className="mt-6 text-xs bg-white/10 hover:bg-accent-blue/20 text-white px-3 py-2 rounded-sm transition-colors border border-white/5"
                                    >
                                        Visualize This Trend
                                    </button>
                                </div>

                                <div className="bg-black/40 border border-white/10 rounded-lg p-6">
                                    <h3 className="text-white/60 font-mono text-xs uppercase tracking-wider mb-4">Control Panel</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-[10px] uppercase text-white/40 mb-1">X-Axis Metric</label>
                                            <select
                                                className="w-full bg-black border border-white/20 rounded-sm text-sm p-2 text-white focus:border-accent-blue outline-none"
                                                value={xMetric}
                                                onChange={(e) => setXMetric(e.target.value as any)}
                                            >
                                                {METRIC_KEYS.map(k => <option key={k} value={k}>{METRIC_LABELS[k]}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase text-white/40 mb-1">Y-Axis Metric</label>
                                            <select
                                                className="w-full bg-black border border-white/20 rounded-sm text-sm p-2 text-white focus:border-accent-blue outline-none"
                                                value={yMetric}
                                                onChange={(e) => setYMetric(e.target.value as any)}
                                            >
                                                {METRIC_KEYS.map(k => <option key={k} value={k}>{METRIC_LABELS[k]}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Correlation Matrix Heatmap */}
                            <div className="lg:col-span-8 bg-black/40 border border-white/10 rounded-lg p-6 overflow-x-auto">
                                <h3 className="text-white/60 font-mono text-xs uppercase tracking-wider mb-4">Variable Correlation Matrix</h3>
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-8 gap-1 mb-1">
                                        {/* Header Row */}
                                        <div className="col-span-1"></div>
                                        {METRIC_KEYS.map(k => (
                                            <div key={k} className="text-[9px] uppercase text-white/40 text-center break-words px-1">
                                                {METRIC_LABELS[k].replace('Demographic', 'Demo').replace('Biometric', 'Bio').replace('Enrolment', 'Enrol')}
                                            </div>
                                        ))}
                                    </div>
                                    {METRIC_KEYS.map(rowKey => (
                                        <div key={rowKey} className="grid grid-cols-8 gap-1 mb-1 items-center">
                                            {/* Row Label */}
                                            <div className="text-[9px] uppercase text-white/40 text-right pr-2">
                                                {METRIC_LABELS[rowKey].replace('Demographic', 'Demo').replace('Biometric', 'Bio').replace('Enrolment', 'Enrol')}
                                            </div>
                                            {/* Cells */}
                                            {METRIC_KEYS.map(colKey => {
                                                const val = correlationMatrix[rowKey][colKey];
                                                const isSelf = rowKey === colKey;
                                                return (
                                                    <div
                                                        key={`${rowKey}-${colKey}`}
                                                        onClick={() => {
                                                            if (!isSelf) {
                                                                setXMetric(colKey);
                                                                setYMetric(rowKey);
                                                            }
                                                        }}
                                                        title={`${METRIC_LABELS[rowKey]} vs ${METRIC_LABELS[colKey]}: R=${val.toFixed(2)}`}
                                                        style={{ backgroundColor: isSelf ? '#18181b' : getCellColor(val) }}
                                                        className={`h-10 flex items-center justify-center rounded-sm text-[10px] font-mono text-white cursor-pointer transition-transform hover:scale-105 border border-white/5
                                                            ${xMetric === colKey && yMetric === rowKey ? 'ring-2 ring-white z-10' : ''}
                                                        `}
                                                    >
                                                        {isSelf ? '-' : val.toFixed(2)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Bottom Section: Scatter Plot */}
                        <div className="h-[500px] w-full bg-black/40 border border-white/10 rounded-lg p-6 relative">
                            <h3 className="absolute top-6 left-6 text-white/60 font-mono text-xs uppercase tracking-wider z-10">
                                Scatter Plot: {METRIC_LABELS[xMetric]} vs {METRIC_LABELS[yMetric]}
                            </h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <ScatterChart margin={{ top: 40, right: 20, bottom: 20, left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                                    <XAxis
                                        type="number"
                                        dataKey={xMetric}
                                        name={METRIC_LABELS[xMetric]}
                                        stroke="#666"
                                        tick={{ fill: '#666', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    >
                                        <Label value={METRIC_LABELS[xMetric]} offset={0} position="insideBottom" style={{ fill: '#444', fontSize: '12px', textTransform: 'uppercase' }} />
                                    </XAxis>
                                    <YAxis
                                        type="number"
                                        dataKey={yMetric}
                                        name={METRIC_LABELS[yMetric]}
                                        stroke="#666"
                                        tick={{ fill: '#666', fontSize: 10 }}
                                        tickLine={false}
                                        axisLine={false}
                                    >
                                        <Label value={METRIC_LABELS[yMetric]} angle={-90} position="insideLeft" style={{ fill: '#444', fontSize: '12px', textTransform: 'uppercase' }} />
                                    </YAxis>
                                    <Tooltip
                                        cursor={{ strokeDasharray: '3 3' }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const pt = payload[0].payload as AnalyticsRow;
                                                return (
                                                    <div className="bg-black/90 border border-white/20 p-3 rounded shadow-xl text-xs">
                                                        <p className="font-bold text-white mb-1 uppercase tracking-wider">{pt.district}, {pt.state}</p>
                                                        <p className="text-accent-blue">{METRIC_LABELS[xMetric]}: {pt[xMetric]}</p>
                                                        <p className="text-accent-red">{METRIC_LABELS[yMetric]}: {pt[yMetric]}</p>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Scatter name="Districts" data={data} fill="#fff" fillOpacity={0.6} shape="circle" />
                                </ScatterChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
