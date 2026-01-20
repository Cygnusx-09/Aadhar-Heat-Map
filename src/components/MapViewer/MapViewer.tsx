import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngTuple } from 'leaflet';
import { useStore } from '../../store/useStore';

const INDIA_CENTER: LatLngTuple = [20.5937, 78.9629];
const ZOOM_LEVEL = 5;

// Simple color scale: Light Yellow to Dark Red
const getColor = (value: number, max: number) => {
    if (max === 0) return '#FEF9E7';
    const ratio = value / max;

    // Gradient from yellow (low) to red (high)
    // Low: #FFEDA0 (255, 237, 160)
    // High: #800026 (128, 0, 38)

    if (ratio > 0.8) return '#800026';
    if (ratio > 0.6) return '#BD0026';
    if (ratio > 0.4) return '#E31A1C';
    if (ratio > 0.2) return '#FC4E2A';
    if (ratio > 0.1) return '#FD8D3C';
    return '#FFEDA0';
};

const MapViewer: React.FC = () => {
    const { filteredRecords, ageGroup, drillDown } = useStore();
    const [geoData, setGeoData] = useState<any>(null);
    const [distGeoData, setDistGeoData] = useState<any>(null);

    const [viewMode, setViewMode] = useState<'Choropleth' | 'District' | 'Heatmap'>('Choropleth');

    useEffect(() => {
        // Robust helper to get correct asset URL for GitHub Pages
        const getAssetUrl = (path: string) => {
            const baseUrl = import.meta.env.BASE_URL;
            // Remove potential double slashes
            const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
            // If path starts with slash, remove it to append cleanly
            const cleanPath = path.startsWith('/') ? path.slice(1) : path;
            return `${cleanBase}${cleanPath}`;
        };

        const stateUrl = getAssetUrl('data/india-states.json');
        const distUrl = getAssetUrl('data/india-districts.json');

        console.log('Fetching GeoJSON from:', stateUrl, distUrl);

        fetch(stateUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => setGeoData(data))
            .catch((error) => console.error('Error loading State GeoJSON:', error));

        fetch(distUrl)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
            .then((data) => setDistGeoData(data))
            .catch((error) => console.error('Error loading District GeoJSON:', error));
    }, []);

    // State level aggregation
    const stateData = useMemo(() => {
        const counts: Record<string, number> = {};
        if (!filteredRecords.length) return counts;
        filteredRecords.forEach(r => {
            const val = ageGroup === 'Total' ? r.total_population : (ageGroup === '5-17' ? r.demo_age_5_17 : r.demo_age_17_);
            counts[r.state] = (counts[r.state] || 0) + val;
        });
        return counts;
    }, [filteredRecords, ageGroup]);

    const maxStateVal = useMemo(() => {
        const values = Object.values(stateData);
        return values.length > 0 ? Math.max(...values) : 0;
    }, [stateData]);

    // District level aggregation
    const districtData = useMemo(() => {
        const counts: Record<string, number> = {};
        if (!filteredRecords.length) return counts;
        filteredRecords.forEach(r => {
            const val = ageGroup === 'Total' ? r.total_population : (ageGroup === '5-17' ? r.demo_age_5_17 : r.demo_age_17_);
            counts[r.district] = (counts[r.district] || 0) + val;
        });
        return counts;
    }, [filteredRecords, ageGroup]);

    const maxDistVal = useMemo(() => {
        const values = Object.values(districtData);
        return values.length > 0 ? Math.max(...values) : 0;
    }, [districtData]);

    // Data for Heatmap (Points)
    const pointData = useMemo(() => {
        return filteredRecords.filter(r => r.lat && r.lng).map(r => {
            const val = ageGroup === 'Total' ? r.total_population : (ageGroup === '5-17' ? r.demo_age_5_17 : r.demo_age_17_);
            return { ...r, val };
        });
    }, [filteredRecords, ageGroup]);

    const maxPointVal = useMemo(() => {
        if (pointData.length === 0) return 0;
        return Math.max(...pointData.map(p => p.val));
    }, [pointData]);

    const styleState = (feature: any) => {
        const name = feature.properties.NAME_1; // State Name
        const val = stateData[name] || 0;
        return {
            fillColor: getColor(val, maxStateVal),
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
        };
    };

    const styleDistrict = (feature: any) => {
        // Properties might vary, assuming NAME_2 is district based on search
        const name = feature.properties.NAME_2 || feature.properties.dtname || feature.properties.district;
        const val = districtData[name] || 0;
        return {
            fillColor: getColor(val, maxDistVal),
            weight: 1,
            opacity: 1,
            color: 'white',
            dashArray: '1',
            fillOpacity: 0.7
        };
    };

    const onEachState = (feature: any, layer: any) => {
        layer.on({
            click: () => {
                drillDown('State', feature.properties.NAME_1);
                setViewMode('District'); // Auto-switch to district view on drilldown?
            }
        });
        // Add tooltips
        const name = feature.properties.NAME_1;
        const val = stateData[name] || 0;
        layer.bindTooltip(`${name}: ${val}`, { sticky: true });
    };

    const onEachDistrict = (feature: any, layer: any) => {
        const name = feature.properties.NAME_2 || feature.properties.dtname;
        const val = districtData[name] || 0;
        layer.bindTooltip(`${name}: ${val}`, { sticky: true });
        layer.on({
            click: () => {
                drillDown('District', name);
            }
        });
    };

    return (
        <div className="h-full w-full rounded-lg overflow-hidden border border-gray-200 shadow-sm relative">
            <div className="absolute top-4 right-4 z-[1000] bg-white rounded-md shadow-md flex overflow-hidden">
                <button
                    onClick={() => setViewMode('Choropleth')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'Choropleth' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    State
                </button>
                <button
                    onClick={() => setViewMode('District')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'District' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    District
                </button>
                <button
                    onClick={() => setViewMode('Heatmap')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${viewMode === 'Heatmap' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'}`}
                >
                    Intensity
                </button>
            </div>

            <MapContainer center={INDIA_CENTER} zoom={ZOOM_LEVEL} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                {viewMode === 'Choropleth' && geoData && (
                    <GeoJSON
                        key={`state-${ageGroup}-${filteredRecords.length}`}
                        data={geoData}
                        style={styleState}
                        onEachFeature={onEachState}
                    />
                )}

                {viewMode === 'District' && distGeoData && (
                    <GeoJSON
                        key={`dist-${ageGroup}-${filteredRecords.length}`}
                        data={distGeoData}
                        style={styleDistrict}
                        onEachFeature={onEachDistrict}
                    />
                )}

                {viewMode === 'Heatmap' && pointData.map((point, idx) => (
                    <CircleMarker
                        key={`${point.pincode}-${idx}`}
                        center={[point.lat!, point.lng!]}
                        radius={Math.max(5, (point.val / maxPointVal) * 20)}
                        pathOptions={{
                            fillColor: '#ef4444', // Red-500
                            fillOpacity: 0.6,
                            color: '#b91c1c', // Red-700
                            weight: 1,
                        }}
                    >
                        <Popup>
                            <div className="text-xs">
                                <strong>Pincode: {point.pincode}</strong><br />
                                Pop: {point.val}<br />
                                {point.district}, {point.state}
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

            </MapContainer>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 bg-white/90 p-2 rounded shadow text-xs z-[1000]">
                <p className="font-semibold mb-1">
                    {viewMode === 'Heatmap' ? 'Intensity' : 'Population Density'}
                </p>
                {viewMode !== 'Heatmap' ? (
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#800026]"></span> High</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#E31A1C]"></span> Medium</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#FFEDA0]"></span> Low</div>
                    </div>
                ) : (
                    <div className="text-[10px] text-muted-foreground">
                        Size indicates<br />population count
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapViewer;
