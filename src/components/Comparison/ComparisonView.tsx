import React, { useState, useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { ArrowRightLeft, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

type ComparisonMode = 'State' | 'District';

export const ComparisonView: React.FC = () => {
    const { rawRecords } = useStore();
    const [mode, setMode] = useState<ComparisonMode>('State');
    const [entityA, setEntityA] = useState<string>('');
    const [entityB, setEntityB] = useState<string>('');

    // --- Data Preparation ---

    // 1. Get List of Options
    const options = useMemo(() => {
        const unique = new Set<string>();
        rawRecords.forEach(r => {
            if (mode === 'State') unique.add(r.state);
            else if (r.district) unique.add(r.district); // Assuming unique district names or we append state? Let's use name for now.
        });
        return Array.from(unique).sort();
    }, [rawRecords, mode]);

    // 2. Aggregate Data for an Entity
    const getAggregatedData = (name: string) => {
        if (!name) return null;

        let total = 0;
        let age0_5 = 0;
        let age5_17 = 0;
        let age17Plus = 0;

        rawRecords.forEach(r => {
            if ((mode === 'State' && r.state === name) || (mode === 'District' && r.district === name)) {
                total += r.total_population || 0;
                age0_5 += r.demo_age_0_5 || 0;
                age5_17 += r.demo_age_5_17 || 0;
                age17Plus += r.demo_age_17_ || 0;
            }
        });

        return { name, total, age0_5, age5_17, age17Plus };
    };

    const dataA = useMemo(() => getAggregatedData(entityA), [entityA, mode, rawRecords]);
    const dataB = useMemo(() => getAggregatedData(entityB), [entityB, mode, rawRecords]);

    // Comparison Metrics Config
    const metrics = [
        { key: 'total', label: 'Total Population' },
        { key: 'age0_5', label: 'Children (0-5)' },
        { key: 'age5_17', label: 'School Age (5-17)' },
        { key: 'age17Plus', label: 'Adults (17+)' },
    ];

    const getDelta = (valA: number, valB: number) => {
        if (valB === 0) return { pct: 0, text: '-' };
        const diff = valA - valB;
        const pct = ((diff / valB) * 100);
        return { diff, pct };
    };

    return (
        <div className="h-full flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar pb-24">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-4">
                <div>
                    <h1 className="text-2xl font-mono uppercase tracking-widest text-white">Comparative Analysis</h1>
                    <p className="text-xs text-white/50 font-mono mt-1">
                        Side-by-side performance review of administrative regions.
                    </p>
                </div>

                {/* Mode Switcher */}
                <div className="flex bg-black border border-white/20 rounded-md overflow-hidden">
                    <button
                        onClick={() => { setMode('State'); setEntityA(''); setEntityB(''); }}
                        className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${mode === 'State' ? 'bg-accent-blue text-black font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        State Level
                    </button>
                    <div className="w-[1px] bg-white/20"></div>
                    <button
                        onClick={() => { setMode('District'); setEntityA(''); setEntityB(''); }}
                        className={`px-4 py-2 text-xs font-mono uppercase transition-colors ${mode === 'District' ? 'bg-accent-blue text-black font-bold' : 'text-white/60 hover:text-white'}`}
                    >
                        District Level
                    </button>
                </div>
            </div>

            {/* Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center max-w-4xl mx-auto w-full">
                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-accent-cyan tracking-wider font-bold">Base Entity (A)</label>
                    <select
                        className="w-full bg-black border border-white/20 rounded-md p-3 text-sm text-white focus:border-accent-blue outline-none shadow-lg"
                        value={entityA}
                        onChange={(e) => setEntityA(e.target.value)}
                    >
                        <option value="">-- Select {mode} --</option>
                        {options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>

                <div className="hidden md:flex justify-center text-white/20">
                    <ArrowRightLeft className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] uppercase text-accent-purple tracking-wider font-bold">Comparison Entity (B)</label>
                    <select
                        className="w-full bg-black border border-white/20 rounded-md p-3 text-sm text-white focus:border-accent-blue outline-none shadow-lg"
                        value={entityB}
                        onChange={(e) => setEntityB(e.target.value)}
                    >
                        <option value="">-- Select {mode} --</option>
                        {options.filter(o => o !== entityA).map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                </div>
            </div>

            {/* Comparison Cards */}
            {dataA && dataB ? (
                <div className="space-y-6 max-w-5xl mx-auto w-full mt-4">
                    {metrics.map((m) => {
                        const valA = dataA[m.key as keyof typeof dataA] as number;
                        const valB = dataB[m.key as keyof typeof dataB] as number;
                        const { diff, pct } = getDelta(valA, valB);
                        const isHigher = valA > valB; // 'Better' depends on context, but let's just highlight magnitude
                        const chartData = [
                            { name: dataA.name, value: valA, fill: '#06b6d4' }, // Cyan
                            { name: dataB.name, value: valB, fill: '#a855f7' }  // Purple
                        ];

                        return (
                            <div key={m.key} className="bg-black/40 border border-white/10 rounded-xl p-6 grid grid-cols-12 gap-6 items-center hover:border-white/20 transition-colors group">
                                {/* Metric Label */}
                                <div className="col-span-12 md:col-span-3">
                                    <h3 className="text-sm font-bold text-white/80 uppercase tracking-wide group-hover:text-white transition-colors">{m.label}</h3>
                                </div>

                                {/* Value A */}
                                <div className="col-span-6 md:col-span-2 text-right">
                                    <div className="text-xl font-mono text-white">{new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(valA)}</div>
                                    <div className="text-[10px] text-accent-cyan uppercase">{dataA.name}</div>
                                </div>

                                {/* Visual Bar */}
                                <div className="col-span-12 md:col-span-4 h-16 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart layout="vertical" data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }} barSize={12}>
                                            <XAxis type="number" hide />
                                            <YAxis type="category" dataKey="name" hide />
                                            <Tooltip
                                                cursor={{ fill: 'transparent' }}
                                                contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff', fontSize: '12px' }}
                                                formatter={(value: number) => new Intl.NumberFormat('en-IN').format(value)}
                                            />
                                            <Bar dataKey="value" radius={[0, 4, 4, 0]} background={{ fill: '#ffffff10' }} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Value B */}
                                <div className="col-span-6 md:col-span-2 text-left">
                                    <div className="text-xl font-mono text-white">{new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 }).format(valB)}</div>
                                    <div className="text-[10px] text-accent-purple uppercase">{dataB.name}</div>
                                </div>

                                {/* Delta Indicator */}
                                <div className="col-span-12 md:col-span-1 flex justify-end md:justify-center">
                                    {valA === valB ? (
                                        <Minus className="text-white/20" />
                                    ) : (
                                        <div className={`flex flex-col items-center gap-0.5 ${valA > valB ? 'text-accent-cyan' : 'text-accent-purple'}`}>
                                            {valA > valB ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                                            <span className="text-[10px] font-bold">{Math.abs(pct).toFixed(1)}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-white/30 space-y-4">
                    <ArrowRightLeft className="w-16 h-16 opacity-20" />
                    <p className="text-sm font-mono uppercase tracking-widest">Select two entities to begin comparison</p>
                </div>
            )}
        </div>
    );
};
