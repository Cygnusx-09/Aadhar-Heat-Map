# Product Requirements Document (PRD)
## India Demographic Heatmap Visualization Tool

**Document Version:** 1.0  
**Date:** January 10, 2026  
**Project:** UIDAI Demographic Data Heatmap Visualization Platform  
**Status:** Final

---

## Executive Summary

The India Demographic Heatmap Visualization Tool is an interactive web-based platform designed to visualize UIDAI demographic data across India's geographical regions. Users can upload CSV files containing demographic data (age groups 5-17 and 17+) and instantly see interactive heatmaps of population density by State, District, and Pincode.

**Key Benefits:**
- Real-time data visualization on India's map
- Multi-level geographical hierarchy (State → District → Pincode)
- CSV upload with automatic validation
- Interactive filtering and drill-down capabilities
- Export functionality for reports
- Responsive design for all devices

---

## 1. Problem Statement

### Current Challenges
1. Data Analysis Inefficiency: Manual CSV analysis is time-consuming
2. Limited Visualization: No intuitive geographic visualization
3. Data Complexity: Multiple CSV files require complex merging
4. Information Accessibility: Quick insights needed by location/time
5. Scalability: Existing tools don't handle large datasets

### User Needs
- Quick visualization of demographic patterns by geography
- Upload and validate demographic CSV data
- Filter data by time period, age group, and location
- Compare demographic trends across regions
- Export filtered data for reports

---

## 2. Product Vision

"Enable data-driven decision making by providing an intuitive, interactive visualization platform for India's demographic data, making complex datasets accessible and actionable for policy makers, researchers, and analysts."

---

## 3. Target Users

### Primary Users
1. UIDAI Data Analysts - Manage and visualize enrollment data
2. Public Health Officials - Analyze age-group distribution
3. Government Policy Makers - Make data-driven decisions
4. Research Institutions - Academic research on demographics

---

## 4. Core Features

### 4.1 File Upload & Data Management

**CSV Upload with Validation**
- Input Format: CSV files with UIDAI demographic schema
- Expected Columns: date, state, district, pincode, demo_age_5_17, demo_age_17_
- File Size Limits: Single file 25MB, Total 100MB
- Validation Rules:
  * Check column headers match schema
  * Validate date format (DD-MM-YYYY)
  * Validate pincode (6 digits)
  * Verify numeric fields
  * Check for duplicates
  * Ensure no null values

### 4.2 Interactive Heatmap Visualization

**Map Features**
- Base Map Library: Leaflet.js with TopoJSON/GeoJSON
- Granularity: National → State → District → Pincode
- Color Scheme: Green → Yellow → Orange → Red (by density)
- Hover tooltips showing region name, populations, date
- Click to drill-down through hierarchy
- Breadcrumb navigation

### 4.3 Filtering & Time Controls

**Filter Options**
1. Date Range Picker with presets
2. Geographic Filters (State, District, Pincode)
3. Age Group Filters (5-17, 17+, Total)
4. Population Range Slider
5. Quick Filters (High/Low Density, Urban/Rural)

### 4.4 Analytics Dashboard

**Dashboard Widgets**
1. Summary Statistics Card
2. Distribution Charts (Bar, Pie, Line)
3. Sortable Statistics Table with pagination

### 4.5 Data Export

**Export Options**
- CSV Export (filtered data)
- PDF Report (map + stats + charts)
- Excel Workbook (multiple sheets)
- PNG/SVG Map Export

### 4.6 Comparison Mode

Compare two time periods or regions side-by-side with difference visualization

---

## 5. Technical Specifications

### 5.1 Technology Stack

**Frontend Framework**
- React 18.x with TypeScript
- Tailwind CSS 3.x for styling
- Vite.js for build tooling

**Mapping & Visualization**
- Leaflet.js 1.9.x - Interactive maps
- Leaflet-Heatmap - Heatmap layer
- TopoJSON - Geographic data
- D3.js 7.x / Recharts - Charts

**Data Management**
- PapaParse - CSV parsing
- IndexedDB - Client-side storage
- Apache Arrow/Parquet - Data serialization

**UI Libraries**
- Radix UI / Shadcn/ui - Accessible components
- React Query - State management

**Export**
- jsPDF + html2canvas - PDF generation
- xlsx / ExcelJS - Excel files

### 5.2 Data Model

```typescript
interface DemographicRecord {
  date: string; // DD-MM-YYYY
  state: string;
  district: string;
  pincode: string;
  demo_age_5_17: number;
  demo_age_17_: number;
  total_population?: number;
}
```

### 5.3 Component Architecture

```
App
├── Layout
│   ├── Header
│   ├── Sidebar (FilterPanel)
│   │   ├── DataUpload
│   │   ├── DateRangePicker
│   │   ├── GeographicFilter
│   │   └── AgeGroupFilter
│   └── MapContainer
│       ├── MapViewer (Leaflet)
│       ├── HeatmapLayer
│       ├── Legend
│       └── Tooltip
└── Dashboard
    ├── SummaryStats
    ├── Charts
    ├── DataTable
    └── ExportPanel
```

---

## 6. User Experience Design

### Key UX Principles
1. Intuitive Navigation - Breadcrumbs, back/forward buttons
2. Real-Time Feedback - Loading states, instant updates
3. Data Transparency - Clear legends, tooltips
4. Accessibility - WCAG 2.1 AA compliance, keyboard navigation
5. Mobile Responsive - Touch-friendly, adaptive layouts

### User Flow Example
1. Upload CSV → Validation → Data loaded
2. View national heatmap
3. Apply filters (date, state, age group)
4. Drill down: State → District → Pincode
5. View analytics dashboard
6. Export report

---

## 7. Key User Stories

**Story 1: Data Analyst**
"As a data analyst, I want to upload CSV files and visualize population distribution to identify high-density regions"

**Story 2: Policy Maker**
"As a policy maker, I want to compare data from two months to understand growth trends"

**Story 3: Urban Planner**
"As an urban planner, I want to filter by age group 5-17 to plan child health facilities"

---

## 8. Performance Requirements

- Initial Load: <2 seconds
- Filter Response: <500ms
- Drill-Down Animation: <300ms
- CSV Parse: <5 seconds for 500K records
- Export Generation: <10 seconds for PDF

---

## 9. Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

---

## 10. Implementation Timeline

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Design & Setup | Week 1-2 | Wireframes, repo setup |
| Core Development | Week 3-6 | Upload, validation, map |
| Filters & Dashboard | Week 7-8 | Filters, charts, stats |
| Export & Polish | Week 9-10 | Export, mobile optimization |
| Testing & QA | Week 11-12 | Bug fixes, UAT |
| Deployment | Week 13 | Production release |

---

## 11. Success Metrics

**KPIs**
- User Engagement: >15 min avg session
- Map Interactions: >5 per session
- Export Rate: >40% of sessions
- Validation Success: >95%
- Page Load: <2 seconds
- User Satisfaction: >4.5/5

---

## 12. MVP Features (Phase 1)

✅ Single CSV upload
✅ Data validation
✅ Basic heatmap
✅ Geographic drill-down
✅ Basic filters
✅ Summary statistics
✅ CSV export
✅ Responsive design

---

## 13. Code Libraries Summary

**Essential Libraries to Install:**

```bash
# Core Framework
npm install react react-dom typescript vite
npm install -D @vitejs/plugin-react @types/react

# Styling
npm install tailwindcss postcss autoprefixer
npm install @radix-ui/react-select @radix-ui/react-dialog

# Mapping
npm install leaflet react-leaflet
npm install topojson-client geojson
npm install -D @types/leaflet

# Data Processing
npm install papaparse
npm install -D @types/papaparse

# Charts
npm install recharts
# OR
npm install d3

# State Management
npm install zustand
# OR
npm install @tanstack/react-query

# Export
npm install jspdf html2canvas
npm install xlsx

# Date Picker
npm install react-day-picker date-fns

# Utilities
npm install clsx tailwind-merge
```

---

## 14. Getting Started Instructions

### Step 1: Project Setup
```bash
# Create Vite + React + TypeScript project
npm create vite@latest india-heatmap-tool -- --template react-ts

cd india-heatmap-tool
npm install
```

### Step 2: Install Dependencies
```bash
# Install all required libraries (see section 13)
npm install leaflet react-leaflet papaparse recharts jspdf xlsx
```

### Step 3: Configure Tailwind
```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### Step 4: Setup Folder Structure
```
src/
├── components/
│   ├── MapViewer/
│   ├── DataUpload/
│   ├── FilterPanel/
│   ├── Dashboard/
│   └── ExportPanel/
├── hooks/
├── utils/
├── types/
└── store/
```

### Step 5: Download India GeoJSON
- Get TopoJSON from Natural Earth Data
- Convert to GeoJSON for Leaflet
- Store in `public/data/india-states.json`

### Step 6: Start Development
```bash
npm run dev
```

---

## 15. Quick Start Code Example

**CSV Upload Component:**
```typescript
import Papa from 'papaparse';
import { useState } from 'react';

interface DemographicData {
  date: string;
  state: string;
  district: string;
  pincode: string;
  demo_age_5_17: number;
  demo_age_17_: number;
}

export function CSVUpload() {
  const [data, setData] = useState<DemographicData[]>([]);

  const handleUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: (results) => {
        // Validate and process data
        setData(results.data as DemographicData[]);
      }
    });
  };

  return (
    <input 
      type="file" 
      accept=".csv"
      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
    />
  );
}
```

---

## Document Metadata

**Created:** January 10, 2026  
**For:** UIDAI Data Hackathon 2026  
**Tool:** India Demographic Heatmap Visualization Platform  
**Tech Stack:** React + TypeScript + Leaflet.js + Tailwind CSS  
**Target Completion:** 13 weeks  

---

**END OF DOCUMENT**
