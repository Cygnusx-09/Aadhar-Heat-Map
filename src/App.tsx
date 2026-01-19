import { CSVUpload } from './components/CSVUpload';
import MapViewer from './components/MapViewer/MapViewer';
import { DashboardStats, DashboardCharts } from './components/Dashboard';
import DateRangePicker from './components/DateRangePicker';
import { GeographyFilter } from './components/GeographyFilter';
import { AgeGroupFilter } from './components/AgeGroupFilter';
import { ExportPanel } from './components/ExportPanel';
import { SearchBar } from './components/SearchBar';
import { useStore } from './store/useStore';
import { Activity, Upload, Filter, Map as MapIcon, BarChart3, LayoutDashboard, ArrowRightLeft } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { ComparisonView } from './components/Comparison/ComparisonView';
import { AnomalyPanel } from './components/Anomaly/AnomalyPanel';

function App() {
    const { uploadedFiles, resetFilters, init } = useStore();
    const [activeView, setActiveView] = useState<'Dashboard' | 'Analytics' | 'Comparison'>('Dashboard');

    useEffect(() => {
        init();
    }, [init]);

    return (
        <div className="flex min-h-screen bg-background font-sans text-foreground">
            {/* Sidebar - Fixed */}
            <aside className="w-72 bg-card border-r border-white/5 flex flex-col h-screen sticky top-0 z-20 shrink-0">
                <div className="p-6 border-b border-white/5 space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-accent-red/10 p-2.5 rounded-xl">
                            <Activity className="w-6 h-6 text-accent-red" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg tracking-tight">Demographics</h1>
                            <p className="text-xs text-muted-foreground font-medium">Heatmap Tool</p>
                        </div>
                    </div>
                    {uploadedFiles.length > 0 && <SearchBar />}
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    {/* Navigation */}
                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveView('Dashboard')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${activeView === 'Dashboard' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                        >
                            <LayoutDashboard className="w-4 h-4" />
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveView('Analytics')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${activeView === 'Analytics' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                        >
                            <BarChart3 className="w-4 h-4" />
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveView('Comparison')}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${activeView === 'Comparison' ? 'bg-white/10 text-white' : 'text-muted-foreground hover:bg-white/5 hover:text-white'}`}
                        >
                            <ArrowRightLeft className="w-4 h-4" />
                            Comparison
                        </button>
                    </nav>

                    {/* CSV Upload Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-4 px-1">
                            <Upload className="w-4 h-4 text-accent-red" />
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Data Import</h2>
                        </div>
                        <CSVUpload />
                    </section>

                    {/* Filters Section (Only show in Dashboard view) */}
                    {uploadedFiles.length > 0 && activeView === 'Dashboard' && (
                        <section className="space-y-6 pt-6 border-t border-white/5">
                            <div className="flex items-center justify-between mb-2 px-1">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-accent-red" />
                                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Filters</h2>
                                </div>
                                <button
                                    onClick={resetFilters}
                                    className="text-xs text-accent-red hover:text-accent-red/80 font-medium transition-colors"
                                >
                                    Reset All
                                </button>
                            </div>

                            <div className="space-y-4">
                                <DateRangePicker />
                                <GeographyFilter />

                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-muted-foreground block px-1">Age Group</label>
                                    <AgeGroupFilter />
                                </div>
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 text-[10px] text-center text-muted-foreground/60">
                    UIDAI Hackathon 2026
                </div>
            </aside>

            {/* Main Content - Scrollable */}
            <main className="flex-1 flex flex-col min-w-0 bg-dashboard-bg relative">
                {/* Top Toolbar - Technical Header */}
                {uploadedFiles.length > 0 && (
                    <header className="px-6 py-4 border-b border-white/10 flex items-center justify-between sticky top-0 z-10 bg-black/90 backdrop-blur-sm">
                        <div className="flex items-center gap-6">
                            <div>
                                <h2 className="text-xl font-mono font-bold tracking-tight uppercase text-white/90">{activeView}</h2>
                                <p className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 inline-block mt-1">
                                    DATASET_LOADED: {uploadedFiles.length}
                                </p>
                            </div>
                        </div>
                        {activeView === 'Dashboard' && <ExportPanel />}
                    </header>
                )}

                <div className="flex-1 p-0 flex flex-col">
                    {/* View Switcher */}
                    {uploadedFiles.length > 0 ? (
                        activeView === 'Dashboard' ? (
                            <div className="flex flex-col">
                                {/* Stats Row - Border Bottom */}
                                <div className="w-full border-b border-white/10 p-6">
                                    <DashboardStats />
                                </div>

                                {/* Map Section - Full Width, Technical Frame */}
                                <div className="w-full border-b border-white/10 p-6 relative group">
                                    <div className="mb-4 flex items-center justify-between">
                                        <h3 className="font-mono text-sm uppercase tracking-widest text-accent-blue/80">
                                            <span className="text-accent-red mr-2">●</span>
                                            Geospatial_Density_Map_V1
                                        </h3>
                                        <div className="flex gap-2">
                                            <div className="w-2 h-2 bg-white/20"></div>
                                            <div className="w-2 h-2 bg-white/20"></div>
                                            <div className="w-2 h-2 bg-accent-red animate-pulse"></div>
                                        </div>
                                    </div>

                                    {/* Technical Map Frame */}
                                    <div className="h-[600px] border border-white/10 relative z-0 bg-black/50">
                                        {/* Corner Markers */}
                                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-accent-blue z-20"></div>
                                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-accent-blue z-20"></div>
                                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-accent-blue z-20"></div>
                                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-accent-blue z-20"></div>

                                        <MapViewer />
                                    </div>
                                </div>

                                {/* Charts Section - Simple Grid */}
                                <div className="w-full p-6 bg-black">
                                    <DashboardCharts />
                                </div>
                            </div>
                        ) : activeView === 'Analytics' ? (
                            <AnalyticsDashboard />
                        ) : (
                            <ComparisonView />
                        )
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-white/30 gap-6 min-h-[60vh]">
                            <div className="p-0">
                                <MapIcon className="w-24 h-24 stroke-1 opacity-20" />
                            </div>
                            <div className="text-center space-y-2 font-mono">
                                <h3 className="text-lg font-bold text-white/60 tracking-widest uppercase">System Idle</h3>
                                <p className="text-xs max-w-xs mx-auto opacity-50">Initiate sequence: Upload Aadhar data CSV...</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            {uploadedFiles.length > 0 && <AnomalyPanel />}
        </div>
    );
}

export default App;
