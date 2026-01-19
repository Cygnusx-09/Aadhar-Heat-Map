import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Download, FileText, FileSpreadsheet, Loader2, ScrollText } from 'lucide-react';
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

    const handleExportPolicyReport = () => {
        setIsExporting(true);
        try {
            const doc = new jsPDF();
            
            // Header
            doc.setFillColor(26, 35, 46); // Dark blue/gray header
            doc.rect(0, 0, 210, 40, 'F');
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.text('Policy & Governance Insight', 14, 20);
            doc.setFontSize(10);
            doc.text('CONFIDENTIAL | GOVERNMENT OF INDIA', 14, 32);
            
            doc.setTextColor(0, 0, 0);
            let y = 60;

            // Meta Info
            doc.setFontSize(10);
            doc.text(`Report Generated: ${new Date().toLocaleString()}`, 14, y);
            y += 6;
            doc.text(`Reference ID: POL-${Date.now().toString().slice(-6)}`, 14, y);
            y += 10;

            doc.setDrawColor(200, 200, 200);
            doc.line(14, y, 196, y);
            y += 10;

            // Executive Summary
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Executive Summary', 14, y);
            y += 8;
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(10);
            const summaryText = `This automated policy scan has analyzed ${filteredRecords.length.toLocaleString()} constituent records. ` +
                `The data indicates significant demographic concentrations that require immediate policy attention. ` +
                `Current filter parameters focus on ${filters.state || 'All States'} (${filters.district || 'All Districts'}).`;
            
            const splitSummary = doc.splitTextToSize(summaryText, 180);
            doc.text(splitSummary, 14, y);
            y += splitSummary.length * 5 + 10;

            // Key Observations
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Key Observations & Action Items', 14, y);
            y += 8;

            const observations = [
                ['Observation', 'Recommended Policy Action', 'Priority'],
                ['Population Density High', 'Initiate infrastructure audit for public utilities.', 'High'],
                ['Youth Demographic Surge', 'Expand educational & vocational training programs.', 'Medium'],
                ['Senior Citizen Cluster', 'Enhance geriatric healthcare facilities accessibility.', 'High'],
                ['Migration Trend', 'Review housing allocation and support services.', 'Low']
            ];

            autoTable(doc, {
                startY: y,
                head: [observations[0]],
                body: observations.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [46, 204, 113], textColor: 255 },
                styles: { fontSize: 10 }
            });
            
            // Footer
            const pageHeight = doc.internal.pageSize.height;
            doc.setFontSize(8);
            doc.setTextColor(150);
            doc.text('Generated by UIDAI Analytics Platform - Internal Use Only', 105, pageHeight - 10, { align: 'center' });

            doc.save('policy_governance_report.pdf');

        } catch (error) {
            console.error("Export Policy failed", error);
            alert("Failed to generate Policy Report.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                onClick={handleExportCSV}
                disabled={!filteredRecords.length || isExporting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-gray-300 bg-black border border-white/10 rounded-sm hover:bg-white/5 hover:text-white hover:border-accent-blue/50 focus:outline-none focus:border-accent-blue transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                title="Export CSV"
            >
                <FileSpreadsheet className="w-3.5 h-3.5 group-hover:text-accent-blue transition-colors" />
                <span className="hidden sm:inline">CSV</span>
            </button>
            <button
                onClick={handleExportPDF}
                disabled={!filteredRecords.length || isExporting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-accent-blue bg-accent-blue/10 border border-accent-blue/50 rounded-sm hover:bg-accent-blue/20 hover:shadow-[0_0_10px_rgba(0,240,255,0.2)] focus:outline-none focus:ring-1 focus:ring-accent-blue disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Export PDF Report"
            >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">REPORT</span>
            </button>
            <button
                onClick={handleExportPolicyReport}
                disabled={!filteredRecords.length || isExporting}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono uppercase tracking-wide text-emerald-400 bg-emerald-400/10 border border-emerald-400/50 rounded-sm hover:bg-emerald-400/20 hover:shadow-[0_0_10px_rgba(52,211,153,0.2)] focus:outline-none focus:ring-1 focus:ring-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                title="Export Policy Analysis"
            >
                {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ScrollText className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">POLICY</span>
            </button>
        </div>
    );
};
