import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, FileText, FileSpreadsheet, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import html2canvas from 'html2canvas';

export const ExportPanel: React.FC = () => {
    const { filteredRecords, dateRange, selectedState, selectedDistrict } = useStore();
    const filters = { dateRange, state: selectedState, district: selectedDistrict };
    const [isExporting, setIsExporting] = useState(false);

    const handleExportCSV = () => {
        if (!filteredRecords.length) return;

        const csv = Papa.unparse(filteredRecords);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `demographic_data_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = async () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();

            // Title
            doc.setFontSize(20);
            doc.text('Demographic Analysis Report', 14, 20);

            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
            doc.text(`Total Records: ${filteredRecords.length}`, 14, 34);

            // Filter Summary
            doc.setFontSize(12);
            doc.text('Applied Filters:', 14, 45);
            doc.setFontSize(10);
            let y = 52;
            if (filters.dateRange.start) {
                doc.text(`Date Range: ${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end?.toLocaleDateString()}`, 14, y);
                y += 6;
            }
            if (filters.state) {
                doc.text(`Region: ${filters.state} ${filters.district ? '> ' + filters.district : ''}`, 14, y);
                y += 6;
            }

            // Map Screenshot
            const mapElement = document.querySelector('.leaflet-container') as HTMLElement;
            if (mapElement) {
                // Wait a bit for tiles? No, just try capture.
                const canvas = await html2canvas(mapElement, {
                    useCORS: true,
                    allowTaint: true,
                    logging: false
                });
                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - 28;
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                doc.addImage(imgData, 'PNG', 14, y + 5, imgWidth, imgHeight);
                y += imgHeight + 10;
            }

            // Top Districts Table
            const districts: Record<string, number> = {};
            filteredRecords.forEach(r => {
                districts[r.district] = (districts[r.district] || 0) + r.total_population;
            });
            const topDistricts = Object.entries(districts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([name, pop]) => [name, pop.toLocaleString()]);

            if (topDistricts.length > 0) {
                doc.text('Top 10 Districts by Population:', 14, y + 10);
                autoTable(doc, {
                    startY: y + 15,
                    head: [['District', 'Population']],
                    body: topDistricts,
                });
            }

            doc.save('demographic_report.pdf');

        } catch (error) {
            console.error("Export PDF failed", error);
            alert("Failed to generate PDF. Check console.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleExportCSV}
                disabled={!filteredRecords.length || isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                title="Export CSV"
            >
                <FileSpreadsheet className="w-4 h-4" />
                <span className="hidden sm:inline">CSV</span>
            </button>
            <button
                onClick={handleExportPDF}
                disabled={!filteredRecords.length || isExporting}
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                title="Export PDF Report"
            >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span className="hidden sm:inline">Report</span>
            </button>
        </div>
    );
};
