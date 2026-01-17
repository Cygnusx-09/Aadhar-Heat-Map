import React, { useMemo } from 'react';
import { useStore } from '../../store/useStore';

const DashboardStats: React.FC = () => {
    const { filteredRecords } = useStore();

    const stats = useMemo(() => {
        if (!filteredRecords.length) return {
            totalPop: 0,
            totalAge0_5: 0,
            totalAge5_17: 0,
            totalAge17Plus: 0,
            recordCount: 0
        };

        return filteredRecords.reduce((acc, curr) => {
            // Sum age groups from ALL file types (demo, bio, enrol)
            const age0_5 = (curr.demo_age_0_5 || 0) + (curr.enrol_age_0_5 || 0);
            const age5_17 = (curr.demo_age_5_17 || 0) + (curr.bio_age_5_17 || 0) + (curr.enrol_age_5_17 || 0);
            const age17Plus = (curr.demo_age_17_ || 0) + (curr.bio_age_17_ || 0) + (curr.enrol_age_18_ || 0);

            return {
                totalPop: acc.totalPop + (curr.total_population || 0),
                totalAge0_5: acc.totalAge0_5 + age0_5,
                totalAge5_17: acc.totalAge5_17 + age5_17,
                totalAge17Plus: acc.totalAge17Plus + age17Plus,
                recordCount: acc.recordCount + 1
            };
        }, { totalPop: 0, totalAge0_5: 0, totalAge5_17: 0, totalAge17Plus: 0, recordCount: 0 });
    }, [filteredRecords]);

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3, notation: "compact", compactDisplay: "short" }).format(num);
    };

    const cards = [
        { label: 'Total Population', value: formatNumber(stats.totalPop), sub: 'Individuals' },
        ...(stats.totalAge0_5 > 0 ? [{ label: 'Age 0-5', value: formatNumber(stats.totalAge0_5), sub: 'Toddlers' }] : []),
        { label: 'Age 5-17', value: formatNumber(stats.totalAge5_17), sub: 'School Age' },
        { label: 'Age 17+', value: formatNumber(stats.totalAge17Plus), sub: 'Adults' },
        { label: 'Data Points', value: stats.recordCount.toLocaleString(), sub: 'Records' },
    ];

    return (
        <div className={`grid gap-6 mb-2 ${cards.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {cards.map((card, i) => (
                <div key={i} className="p-4 border border-white/10 bg-black hover:bg-white/5 transition-colors duration-200 group relative">
                    {/* Tech Marker */}
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/20 group-hover:bg-accent-blue transition-colors"></div>

                    <p className="text-[10px] font-mono uppercase tracking-widest text-white/40 mb-2">{card.label}</p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-2xl font-mono font-bold text-white group-hover:text-accent-blue transition-colors">{card.value}</h3>
                        {card.sub && <span className="text-[10px] font-mono text-white/50">{card.sub}</span>}
                    </div>

                    {/* Bottom Line Progress simulated */}
                    <div className="absolute bottom-0 left-0 h-[1px] bg-accent-blue/50 w-0 group-hover:w-full transition-all duration-500"></div>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
