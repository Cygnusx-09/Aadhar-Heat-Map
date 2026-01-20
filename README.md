<div align="center">

# 🇮🇳 India Demographic Heatmap Tool

### Interactive Geospatial Visualization for Aadhar Demographic Data

[![Live Demo](https://img.shields.io/badge/demo-live-success?style=for-the-badge)](https://cygnusx-09.github.io/Aadhar-Heat-Map/)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)
[![Made for UIDAI](https://img.shields.io/badge/UIDAI-Hackathon%202026-orange?style=for-the-badge)](https://github.com/Cygnusx-09/Aadhar-Heat-Map)

[Features](#-features) • [Demo](#-live-demo) • [Installation](#-installation) • [Usage](#-usage) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## 📖 Overview

A **high-performance, interactive web application** for visualizing and analyzing Indian demographic data from Aadhar records. Built with modern web technologies, this tool provides powerful insights through interactive maps, trend analysis, and AI-powered anomaly detection.

**Perfect for:**
- 📊 Policy makers analyzing demographic trends
- 🏛️ Government agencies tracking enrollment data
- 🔬 Researchers studying population patterns
- 📈 Data analysts exploring regional comparisons

## ✨ Features

### 🗺️ Interactive Heatmap Dashboard
- **Multi-level drill-down** - Navigate from national → state → district → pincode
- **Real-time heat map** visualization with color-coded population density
- **Click-to-explore** interface with smooth transitions
- **Responsive design** - Works on desktop, tablet, and mobile

### 📊 Advanced Analytics
- **Trend Analysis** - Visualize demographic, biometric, and enrollment trends over time
- **Comparison View** - Side-by-side regional comparisons with delta calculations
- **Statistical Charts** - Age distribution, enrollment rates, and population growth
- **Smart Sampling** - Handles large datasets (50,000+ records) efficiently

### 🤖 AI-Powered Anomaly Detection
- **Automatic detection** of data quality issues
- **Z-score analysis** for statistical outliers
- **Severity classification** (Critical, Warning, Info)
- **One-click navigation** to anomalous regions

### 🔍 Smart Search & Filters
- **Instant search** for states and districts
- **Date range filtering** for temporal analysis
- **Age group segmentation** (0-5, 5-17, 17+)
- **Geography filters** (State, District, Pincode)

### 💾 Data Persistence & Export
- **IndexedDB storage** - Data persists across sessions
- **CSV Export** - Download filtered datasets
- **PDF Reports** - Generate professional demographic reports
- **PNG Export** - Save map visualizations as images

### ⚡ Performance Optimized
- **Web Workers** for background CSV processing
- **Lazy loading** for optimal initial load time
- **Memoized calculations** to prevent unnecessary re-renders
- **Efficient state management** with Zustand

## 🚀 Live Demo

**Try it now:** [https://cygnusx-09.github.io/Aadhar-Heat-Map/](https://cygnusx-09.github.io/Aadhar-Heat-Map/)

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Custom CSS |
| **State Management** | Zustand |
| **Maps** | Leaflet, React-Leaflet, Leaflet.heat |
| **Charts** | Recharts |
| **Data Processing** | PapaParse, Web Workers |
| **Storage** | IndexedDB (idb) |
| **Export** | jsPDF, html2canvas, XLSX |
| **UI Components** | Radix UI, Lucide Icons |
| **Build Tool** | Vite |
| **Deployment** | GitHub Pages, GitHub Actions |

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Cygnusx-09/Aadhar-Heat-Map.git
cd Aadhar-Heat-Map

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

## 📚 Usage

### 1. Upload Data

Prepare a CSV file with the following structure:

```csv
date,state,district,pincode,total_population,demo_age_0_5,demo_age_5_17,demo_age_17_plus,enrol_age_5_17
01-01-2024,Maharashtra,Mumbai,400001,50000,5000,15000,30000,14500
```

**Required Columns:**
- `date` (DD-MM-YYYY format)
- `state`, `district`, `pincode`
- `total_population`
- Age group columns (demographic, biometric, or enrollment)

See [CSV Schema Documentation](.agent/csv_schema.md) for detailed format specifications.

### 2. Explore the Dashboard

- **View Statistics** - See population totals and age group breakdowns
- **Interact with Map** - Click regions to drill down
- **Apply Filters** - Narrow down by date, geography, or age group
- **Export Data** - Download reports in multiple formats

### 3. Analyze Trends

Navigate to the **Analytics** tab to:
- View demographic trends over time
- Analyze biometric coverage
- Track enrollment patterns
- Identify growth or decline patterns

### 4. Compare Regions

Use the **Comparison** tab to:
- Select two states or districts
- View side-by-side statistics
- See percentage differences
- Identify regional disparities

### 5. Detect Anomalies

Click the **AI Pulse** button to:
- Automatically detect data quality issues
- Find statistical outliers
- Identify unusual patterns
- Navigate to problematic regions

For detailed instructions, see the [User Guide](USER_GUIDE.md).

## 📊 Data Format

The application supports multiple CSV schemas:

### Demographic Schema
```
demo_age_0_5, demo_age_5_17, demo_age_17_plus
```

### Biometric Schema
```
bio_age_0_5, bio_age_5_17, bio_age_17_plus
```

### Enrollment Schema
```
age_0_5, age_5_17, age_18_greater, enrol_age_5_17
```

The application **automatically detects and normalizes** different schemas for seamless integration.

## 🏗️ Project Structure

```
Aadhar-Heat-Map/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment
├── public/
│   └── .nojekyll              # GitHub Pages configuration
├── src/
│   ├── components/            # React components
│   │   ├── Analytics/         # Trend analysis components
│   │   ├── Anomaly/          # AI anomaly detection
│   │   ├── Comparison/       # Regional comparison
│   │   ├── Dashboard/        # Main dashboard components
│   │   └── MapViewer/        # Leaflet map integration
│   ├── lib/                  # Utility libraries
│   │   ├── db.ts            # IndexedDB operations
│   │   └── utils.ts         # Helper functions
│   ├── store/               # Zustand state management
│   ├── types/               # TypeScript type definitions
│   ├── utils/               # Business logic utilities
│   │   ├── analytics.ts    # Analytics calculations
│   │   ├── anomaly.ts      # Anomaly detection algorithms
│   │   └── trends.ts       # Trend analysis
│   ├── workers/            # Web Workers
│   │   └── csvParser.worker.ts
│   ├── App.tsx             # Main application component
│   └── main.tsx            # Application entry point
├── .agent/                 # Development documentation
├── USER_GUIDE.md          # End-user documentation
├── README.md              # This file
└── package.json           # Project dependencies
```

## 🧪 Development

### Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
npm run deploy   # Deploy to GitHub Pages
```

### Code Style

This project uses:
- **ESLint** for code linting
- **TypeScript** for type safety
- **Prettier** for code formatting (recommended)

### Adding New Features

1. Create feature branch: `git checkout -b feature/your-feature`
2. Make changes and test thoroughly
3. Commit with descriptive messages
4. Push and create a Pull Request

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📖 Documentation

- **[User Guide](USER_GUIDE.md)** - Complete tutorial with screenshots
- **[CSV Schema](.agent/csv_schema.md)** - Data format specifications
- **[Contributing Guidelines](CONTRIBUTING.md)** - How to contribute
- **[Code of Conduct](CODE_OF_CONDUCT.md)** - Community standards

## 🤝 Contributing

We welcome contributions from the community! Whether it's:

- 🐛 Bug reports
- 💡 Feature requests
- 📝 Documentation improvements
- 🔧 Code contributions

Please read our [Contributing Guidelines](CONTRIBUTING.md) before submitting a PR.

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **UIDAI Hackathon 2026** for the opportunity
- **Leaflet** for the amazing mapping library
- **React** and **TypeScript** communities
- All contributors and testers

## 📞 Contact & Support

- **Issues**: [GitHub Issues](https://github.com/Cygnusx-09/Aadhar-Heat-Map/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Cygnusx-09/Aadhar-Heat-Map/discussions)
- **Repository**: [Cygnusx-09/Aadhar-Heat-Map](https://github.com/Cygnusx-09/Aadhar-Heat-Map)

## 🌟 Star History

If you find this project useful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

**Built with ❤️ for UIDAI Hackathon 2026**

[⬆ Back to Top](#-india-demographic-heatmap-tool)

</div>
