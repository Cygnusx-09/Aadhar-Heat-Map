import React, { useMemo, useState } from 'react';
import { useStore } from '../../store/useStore';
import { detectAnomalies, Anomaly } from '../../utils/anomaly';
import { AlertTriangle, AlertCircle, Info, X, Zap } from 'lucide-react';

export const AnomalyPanel: React.FC = () => {
    const { filteredRecords, drillDown } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    // Memoize detection so it doesn't run on every render, only when data changes
    const anomalies = useMemo(() => detectAnomalies(filteredRecords), [filteredRecords]);

    const criticalCount = anomalies.filter(a => a.type === 'Critical').length;
    const warningCount = anomalies.filter(a => a.type === 'Warning').length;

    if (anomalies.length === 0) return null;

    const getIcon = (type: string) => {
        switch (type) {
            case 'Critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
            case 'Warning': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            default: return <Info className="w-4 h-4 text-blue-400" />;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case 'Critical': return 'border-red-500/50 bg-red-500/10';
            case 'Warning': return 'border-yellow-500/50 bg-yellow-500/10';
            default: return 'border-blue-400/50 bg-blue-400/10';
        }
    };

    return (
        <>
            {/* Trigger Button - Floating or integrated? Let's make it a fixed pill near bottom right or top right */}
            {/* Actually, integrated into the UI (header or sidebar) is better. Let's put it fixed bottom-right for "Toast" style access */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)] border border-white/10 backdrop-blur-md transition-all hover:scale-105 active:scale-95
                    ${criticalCount > 0 ? 'bg-red-900/80 text-white animate-pulse-slow' : 'bg-black/80 text-white'}
                `}
            >
                <div className="relative">
                    <Zap className="w-5 h-5 text-accent-cyan" />
                    {anomalies.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-cyan opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-cyan"></span>
                        </span>
                    )}
                </div>
                <div className="flex flex-col items-start leading-none">
                    <span className="text-xs font-bold uppercase tracking-wide">AI Pulse</span>
                    <span className="text-[10px] text-white/50">{anomalies.length} Issues Detected</span>
                </div>
            </button>

            {/* Slide-over Panel */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

                    {/* Drawer */}
                    <div className="relative w-full max-w-sm h-full bg-[#09090b] border-l border-white/10 shadow-2xl flex flex-col animate-slide-in-right">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Zap className="w-5 h-5 text-accent-cyan" />
                                <h2 className="text-lg font-mono font-bold uppercase tracking-wider text-white">Anomaly Scan</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {anomalies.map((anomaly) => (
                                <div
                                    key={anomaly.id}
                                    className={`p-4 rounded-lg border ${getColor(anomaly.type)} relative group hover:bg-white/5 transition-colors cursor-pointer`}
                                    onClick={() => {
                                        drillDown('District', anomaly.district); // Or State? Logic inside detects.
                                        setIsOpen(false);
                                    }}
                                >
                                    <div className="flex items-start gap-3">
                                        <div className="mt-0.5">{getIcon(anomaly.type)}</div>
                                        <div>
                                            <h3 className="text-sm font-bold text-white mb-1 leading-tight">{anomaly.title}</h3>
                                            <p className="text-xs text-white/70 leading-relaxed mb-2">{anomaly.description}</p>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white/50 font-mono uppercase">
                                                    {anomaly.district}, {anomaly.state}
                                                </span>
                                                <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-white/50 font-mono uppercase">
                                                    Score: {anomaly.score.toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Hint */}
                                    <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-accent-cyan font-bold uppercase">
                                        Inspect
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-white/10 bg-black/20 text-[10px] text-center text-white/30">
                            Powered by Statistical Z-Score Analysis
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
