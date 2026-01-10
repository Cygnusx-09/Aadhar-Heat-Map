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

        return filteredRecords.reduce((acc, curr) => ({
            totalPop: acc.totalPop + (curr.total_population || 0),
            totalAge0_5: acc.totalAge0_5 + (curr.demo_age_0_5 || 0),
            totalAge5_17: acc.totalAge5_17 + (curr.demo_age_5_17 || 0),
            totalAge17Plus: acc.totalAge17Plus + (curr.demo_age_17_ || 0),
            recordCount: acc.recordCount + 1
        }), { totalPop: 0, totalAge0_5: 0, totalAge5_17: 0, totalAge17Plus: 0, recordCount: 0 });
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
        <div className={`grid gap-4 mb-6 ${cards.length === 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
            {cards.map((card, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/30 border border-muted-foreground/10 flex flex-col justify-center">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.label}</p>
                    <p className="text-2xl font-bold mt-1 text-foreground">{card.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{card.sub}</p>
                </div>
            ))}
        </div>
    );
};

export default DashboardStats;
