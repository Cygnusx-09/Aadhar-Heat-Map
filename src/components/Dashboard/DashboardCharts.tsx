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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            {/* Top Regions - Vertical Bar Chart */}
            <div className="flex-1 p-6 border border-white/10 bg-black/40 flex flex-col min-h-[600px] relative">
                {/* Tech Corner */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/30"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/30"></div>

                <div className="mb-6 border-b border-white/10 pb-2 flex justify-between items-end">
                    <div>
                        <h3 className="font-mono text-sm uppercase tracking-widest text-white/80">Region_Analysis</h3>
                        <p className="text-[10px] font-mono text-white/40">DENSITY_SORT_DESC</p>
                    </div>
                    <div className="text-[10px] font-mono text-accent-blue">SYS_READY</div>
                </div>
                <div className="flex-1 min-h-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topRegions} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="1 1" horizontal={false} stroke="#333" />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={100}
                                tick={{ fontSize: 10, fill: '#666', fontFamily: 'monospace' }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#000',
                                    border: '1px solid #333',
                                    color: '#fff',
                                    fontFamily: 'monospace'
                                }}
                                itemStyle={{ color: '#00f0ff' }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value: number) => new Intl.NumberFormat('en-IN').format(value)}
                                cursor={{ fill: '#00f0ff', opacity: 0.1 }}
                            />
                            <Bar
                                dataKey="value"
                                fill="#00f0ff"
                                barSize={10}
                                activeBar={{ fill: '#fff' }}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>


            {/* Age Distribution - Donut Chart Style */}
            <div className="flex-1 p-6 border border-white/10 bg-black/40 flex flex-col min-h-[600px] relative">
                {/* Tech Corner */}
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/30"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/30"></div>

                <div className="mb-6 border-b border-white/10 pb-2 flex justify-between items-end">
                    <div>
                        <h3 className="font-mono text-sm uppercase tracking-widest text-white/80">Demographics_Dist</h3>
                        <p className="text-[10px] font-mono text-white/40">AGE_GROUP_SEGMENTATION</p>
                    </div>
                    <div className="text-[10px] font-mono text-accent-red">LIVE_DATA</div>
                </div>
                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={ageDistribution}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {ageDistribution.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#18181b',
                                    borderRadius: '12px',
                                    border: '1px solid #27272a',
                                    color: '#fff',
                                    boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                                }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                                formatter={(value: number) => new Intl.NumberFormat('en-IN').format(value)}
                            />
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px', color: '#a1a1aa' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default DashboardCharts;
