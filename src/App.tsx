import { useState } from 'react';
import { CSVUpload } from './components/CSVUpload';
import MapViewer from './components/MapViewer/MapViewer'; // Check path
import { DashboardStats, DashboardCharts } from './components/Dashboard';
import DateRangePicker from './components/DateRangePicker';
import { GeographyFilter } from './components/GeographyFilter';
import { AgeGroupFilter } from './components/AgeGroupFilter';
import { ExportPanel } from './components/ExportPanel';
import { useStore } from './store/useStore';
import { Activity, Upload, Filter, Map as MapIcon } from 'lucide-react';

function App() {
    const { uploadedFiles, resetFilters } = useStore();

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Sidebar */}
            <aside className="w-80 bg-white border-r border-gray-200 flex flex-col h-full shadow-lg z-10">
                <div className="p-4 border-b border-gray-100 bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-2 rounded-lg shadow-sm">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-gray-900 text-lg leading-tight">Demographics</h1>
                            <p className="text-xs text-muted-foreground font-medium">Heatmap Tool</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                    {/* CSV Upload Section */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Upload className="w-4 h-4 text-primary" />
                            <h2 className="text-sm font-semibold text-gray-700">Data Import</h2>
                        </div>
                        <CSVUpload />
                    </section>

                    {/* Filters Section */}
                    {uploadedFiles.length > 0 && (
                        <section className="space-y-4 pt-4 border-t border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-primary" />
                                    <h2 className="text-sm font-semibold text-gray-700">Filters</h2>
                                </div>
                                <button
                                    onClick={resetFilters}
                                    className="text-xs text-primary hover:underline font-medium"
                                >
                                    Reset All
                                </button>
                            </div>

                            <DateRangePicker />
                            <GeographyFilter />

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 block">Age Group</label>
                                <AgeGroupFilter />
                            </div>
                        </section>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-100 bg-gray-50 text-xs text-center text-gray-400">
                    UIDAI Hackathon 2026
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden bg-gray-50">
                {/* Top Toolbar */}
                {uploadedFiles.length > 0 && (
                    <header className="px-6 py-3 bg-white border-b border-gray-200 flex items-center justify-between shrink-0 shadow-sm z-20">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
                            <div className="h-4 w-px bg-gray-300"></div>
                            <p className="text-sm text-muted-foreground">
                                {uploadedFiles.length} file{uploadedFiles.length !== 1 && 's'} loaded
                            </p>
                        </div>
                        <ExportPanel />
                    </header>
                )}

                <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-6">
                    {/* Map Section */}
                    <div className="flex flex-col gap-3 min-h-[500px] flex-1">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-700">Geospatial Distribution</h3>
                        </div>
                        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative min-h-[400px]">
                            {uploadedFiles.length === 0 ? (
                                <div className="h-full w-full flex flex-col items-center justify-center text-gray-400 gap-4 bg-gray-50/50">
                                    <MapIcon className="w-16 h-16 opacity-20" />
                                    <p className="text-sm font-medium">Upload demographic data to visualize</p>
                                </div>
                            ) : (
                                <MapViewer />
                            )}
                        </div>
                    </div>

                    {/* Analytics Section */}
                    {uploadedFiles.length > 0 && (
                        <div className="shrink-0 space-y-4">
                            <h3 className="text-sm font-medium text-gray-700">Key Metrics</h3>
                            <div className="h-[340px] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6 flex gap-6">
                                <div className="w-1/3 overflow-y-auto pr-2">
                                    <DashboardStats />
                                </div>
                                <div className="w-px bg-gray-100 my-2"></div>
                                <div className="w-2/3 h-full">
                                    <DashboardCharts />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default App;
