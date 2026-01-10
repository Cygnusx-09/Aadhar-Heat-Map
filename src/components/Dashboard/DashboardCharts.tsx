import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useStore } from '../../store/useStore';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const DashboardCharts: React.FC = () => {
    const { filteredRecords } = useStore();

    const { topRegions, ageDistribution } = useMemo(() => {
        if (!filteredRecords.length) return { topRegions: [], ageDistribution: [] };

        // Top Regions (State level aggregation for simplicity for now)
        const regionMap: Record<string, number> = {};
        let total0_5 = 0;
        let total5_17 = 0;
        let total17Plus = 0;

        filteredRecords.forEach(r => {
            regionMap[r.state] = (regionMap[r.state] || 0) + (r.total_population || 0);
            total0_5 += (r.demo_age_0_5 || 0);
            total5_17 += (r.demo_age_5_17 || 0);
            total17Plus += (r.demo_age_17_ || 0);
        });

        const topRegions = Object.entries(regionMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

        const ageDistribution = [
            ...(total0_5 > 0 ? [{ name: '0-5 Years', value: total0_5 }] : []),
            { name: '5-17 Years', value: total5_17 },
            { name: '17+ Years', value: total17Plus },
        ];

        return { topRegions, ageDistribution };
    }, [filteredRecords]);

    if (!filteredRecords.length) {
        return (
            <div className="grid grid-cols-2 gap-6 h-full">
                <div className="rounded-xl border p-4 bg-muted/5 flex items-center justify-center text-muted-foreground text-sm italic">
                    Upload data to see Top Regions
                </div>
                <div className="rounded-xl border p-4 bg-muted/5 flex items-center justify-center text-muted-foreground text-sm italic">
                    Upload data to see Age Distribution
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-6 h-full">
            <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col">
                <h3 className="text-sm font-semibold mb-4 text-foreground/80">Top 5 States by Population</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topRegions} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11 }} />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value: number) => new Intl.NumberFormat('en-IN').format(value)}
                            />
                            <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="rounded-xl border p-4 bg-white shadow-sm flex flex-col">
                <h3 className="text-sm font-semibold mb-4 text-foreground/80">Demographic Distribution</h3>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ageDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {ageDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value: number) => new Intl.NumberFormat('en-IN').format(value)} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
