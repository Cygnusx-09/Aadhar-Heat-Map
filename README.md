# India Demographic Heatmap Tool 🇮🇳

A high-performance, interactive geospatial visualization tool for analyzing Indian demographic data. Built for the **UIDAI Hackathon 2026**.

![Dashboard Preview](screenshot.png) *Add a screenshot here*

## 🚀 Features

- **Multi-Schema Support**: Seamlessly upload and integrate data from:
  - **Demographic CSVs**: Standard age group columns.
  - **Biometric CSVs**: `bio_age` prefixed columns.
  - **Enrolment CSVs**: Detailed age breakdowns including 0-5 years.
- **Interactive Heatmap**:
  - **Choropleth Maps**: State and District level visualization.
  - **Intensity Heatmap**: Point-based visualization using Lat/Lng data.
  - **Drill-down Capability**: Click on states to zoom into districts.
- **Rich Analytics Dashboard**:
  - Real-time summary statistics (Total Population, Age Groups).
  - Use of **Recharts** for visualizing Top Regions and Age Distribution.
- **Advanced Filtering**:
  - **Geography**: Filter by State, District, or Pincode.
  - **Date Range**: Analyze specific timeframes.
  - **Age Group**: Toggle between Total, 5-17, 17+, and 0-5 (where available).
- **Export Capabilities**:
  - **CSV Export**: Download filtered datasets.
  - **PDF Reports**: Generate comprehensive demographic reports with map snapshots.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Maps**: Leaflet, React-Leaflet
- **Charts**: Recharts
- **Data Processing**: PapaParse (CSV), jsPDF (Reports)

## 📦 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/india-demographic-heatmap.git
   cd india-demographic-heatmap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## 📊 Data Format

The application supports CSV files with the following core columns:
- `date` (DD-MM-YYYY)
- `state`
- `district`
- `pincode`
- `lat`, `lng` (Optional, for intensity map)

It automatically detects and normalizes:
- **Demographic**: `demo_age_5_17`, `demo_age_17_`
- **Biometric**: `bio_age_5_17`, `bio_age_17_`
- **Enrolment**: `age_0_5`, `age_5_17`, `age_18_greater`

## 📄 License

MIT License
