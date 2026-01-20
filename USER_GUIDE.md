# India Demographic Heatmap Tool - User Guide

Welcome to the **India Demographic Heatmap Tool**! This comprehensive guide will walk you through all features of the application and help you analyze Aadhar demographic data effectively.

## Table of Contents
1. [Getting Started](#getting-started)
2. [Uploading Data](#uploading-data)
3. [Dashboard View](#dashboard-view)
4. [Analytics View](#analytics-view)
5. [Comparison View](#comparison-view)
6. [Search Feature](#search-feature)
7. [AI Anomaly Detection](#ai-anomaly-detection)
8. [Filters and Controls](#filters-and-controls)
9. [Exporting Data](#exporting-data)
10. [Tips and Best Practices](#tips-and-best-practices)

---

## Getting Started

### Accessing the Application

**Live URL**: https://cygnusx-09.github.io/Aadhar-Heat-Map/

When you first open the application, you'll see the initial screen:

![Initial Screen](/C:/Users/piyus/.gemini/antigravity/brain/41200cbd-f200-4be0-ab29-189187c12941/tutorial_initial_screen_1768909985581.png)

### Interface Overview

The application has two main sections:

1. **Left Sidebar** - Contains navigation, data upload, and filters
2. **Main Content Area** - Displays visualizations and analytics

### Navigation Tabs

Three main views are available:
- **Dashboard** - Map visualization and key statistics
- **Analytics** - Trend analysis and advanced insights
- **Comparison** - Side-by-side regional comparisons

---

## Uploading Data

### Step 1: Prepare Your CSV File

Your CSV file should contain Aadhar demographic data with the following columns:
- `date` - Date in DD-MM-YYYY format
- `state` - State name
- `district` - District name
- `pincode` - PIN code
- `total_population` - Total population count
- `demo_age_0_5` - Population aged 0-5
- `demo_age_5_17` - Population aged 5-17
- `demo_age_17_plus` - Population aged 17+
- `enrol_age_5_17` - Enrollment count for age 5-17
- `biometric_*` - Various biometric data fields

> **Note**: For detailed CSV schema, check the `.agent/csv_schema.md` file in the repository.

### Step 2: Upload Your File

1. Locate the **DATA IMPORT** section in the left sidebar
2. Click on the **UPLOAD CSV** area or drag and drop your CSV file
3. The application will automatically parse and validate your data
4. Once uploaded, the data persists in your browser (even after refresh!)

### Step 3: Verify Upload

After upload, you'll see:
- File name displayed in the upload section
- Navigation tabs become active
- Dashboard automatically loads with your data

---

## Dashboard View

The Dashboard is your main hub for visualizing demographic data.

![Dashboard View](/C:/Users/piyus/.gemini/antigravity/brain/41200cbd-f200-4be0-ab29-189187c12941/tutorial_dashboard_view_1768910016183.png)

### Key Statistics Cards

At the top, you'll find summary statistics:
- **Total Population** - Overall population count
- **Age 0-5** - Population in 0-5 age group
- **Age 5-17** - Population in 5-17 age group  
- **Age 17+** - Population aged 17 and above

Each card shows:
- Current value
- Percentage change (if applicable)
- Visual indicator (up/down arrow)

### Interactive Heat Map

The centerpiece is an interactive map of India showing:
- **Color-coded regions** - Darker colors indicate higher population density
- **Clickable areas** - Click on states or districts to drill down
- **Zoom controls** - Zoom in/out for detailed views
- **Legend** - Shows the color scale for population density

**How to Use:**
1. **Hover** over a region to see quick stats
2. **Click** on a state to drill down to district level
3. **Click** on a district to see pincode-level data
4. Use the **breadcrumb** navigation to go back up

### Charts Section

Below the map, you'll find various charts:
- **Demographic Distribution** - Age group breakdowns
- **Enrollment Trends** - Education enrollment data
- **Biometric Coverage** - Biometric data collection stats

---

## Analytics View

The Analytics view provides advanced trend analysis over time.

![Analytics View](/C:/Users/piyus/.gemini/antigravity/brain/41200cbd-f200-4be0-ab29-189187c12941/tutorial_analytics_view_1768910058382.png)

### Three Main Chart Panels

#### 1. Demographic Trends
Shows population changes across different age groups over time:
- Age 0-5 population trend
- Age 5-17 population trend
- Age 17+ population trend

#### 2. Biometric Trends
Displays biometric data collection progress:
- Iris scan coverage
- Fingerprint coverage
- Overall biometric enrollment

#### 3. Enrollment Trends
Tracks education enrollment over time:
- Total enrollments
- Enrollment rate changes
- Growth patterns

### How to Use Analytics

1. **Hover** over data points to see exact values
2. **Click** on legend items to show/hide specific metrics
3. **Zoom** into specific time periods by selecting a range
4. Look for **patterns and anomalies** in the trends

### Performance Note

For large datasets (>50,000 records), the application uses intelligent sampling to maintain performance while preserving data accuracy.

---

## Comparison View

Compare different states or districts side-by-side.

![Comparison View](/C:/Users/piyus/.gemini/antigravity/brain/41200cbd-f200-4be0-ab29-189187c12941/tutorial_comparison_view_1768910104857.png)

### How to Compare Regions

1. **Select Entity A** - Choose a state or district from the first dropdown
2. **Select Entity B** - Choose another region from the second dropdown
3. **View Comparison** - See side-by-side statistics and charts

### Comparison Metrics

The comparison shows:
- **Population totals** with percentage differences
- **Age group distributions**
- **Enrollment rates**
- **Biometric coverage**
- **Visual bar charts** for easy comparison

### Understanding the Results

- **Green arrows (↑)** - Entity A has higher values
- **Red arrows (↓)** - Entity A has lower values
- **Percentage differences** - Shows the magnitude of difference
- **Bar charts** - Visual representation of metric comparisons

---

## Search Feature

Quickly find and navigate to specific locations.

![Search Feature](/C:/Users/piyus/.gemini/antigravity/brain/41200cbd-f200-4be0-ab29-189187c12941/tutorial_search_feature_1768910125867.png)

### How to Use Search

1. **Locate the search bar** in the sidebar (appears after uploading data)
2. **Type** a state or district name
3. **Select** from the dropdown suggestions
4. The application will automatically **drill down** to that location

### Search Features

- **Auto-complete** - Suggestions appear as you type
- **Type indicators** - Shows whether result is a State or District
- **Location icons** - Visual indicators for each result
- **Instant navigation** - Click to jump directly to that region

---

## AI Anomaly Detection

The AI Pulse feature automatically detects data quality issues and statistical anomalies.

![Anomaly Detection](/C:/Users/piyus/.gemini/antigravity/brain/41200cbd-f200-4be0-ab29-189187c12941/tutorial_anomaly_panel_1768910147762.png)

### Accessing Anomaly Detection

Look for the **AI PULSE** floating button in the bottom-right corner of the screen. It appears after you upload data.

### Types of Anomalies Detected

#### 🔴 Critical (Red)
- Zero population entries
- Data entry errors
- Missing required fields

#### 🟡 Warning (Yellow)
- Low enrollment rates (below statistical average)
- Unusual demographic distributions
- Potential data quality issues

#### 🔵 Info (Blue)
- Statistical outliers
- Unusual patterns worth investigating
- Age distribution anomalies

### How to Use

1. **Click** the AI PULSE button to open the panel
2. **Review** detected anomalies sorted by severity
3. **Click** on an anomaly to navigate to that location
4. **Investigate** the data for that region

### Understanding Z-Scores

Each anomaly shows a **score** indicating how many standard deviations it is from the mean:
- **Score > 2** - Statistically significant anomaly
- **Score > 3** - Highly unusual, requires attention
- **Score > 5** - Critical outlier

---

## Filters and Controls

### Date Range Filter

Filter data by specific time periods:
1. Click on the **date range picker**
2. Select **start date** and **end date**
3. Data automatically updates to show only that period

### Geography Filters

Narrow down your view:
- **State Filter** - Select specific states
- **District Filter** - Choose districts (after selecting a state)
- **Pincode Filter** - Drill down to pincode level

### Age Group Filter

Focus on specific demographics:
- **Total** - All age groups
- **Age 0-5** - Young children
- **Age 5-17** - School-age population
- **Age 17+** - Adults

### Reset Filters

Click the **Reset All** button to clear all filters and return to the full dataset view.

---

## Exporting Data

### Export Options

The **Export Panel** (top-right of Dashboard) offers multiple formats:

#### 📊 Excel Export
- Complete dataset in `.xlsx` format
- Includes all filtered data
- Preserves formulas and formatting

#### 📄 PDF Report
- Professional demographic report
- Includes charts and statistics
- Ready for presentations

#### 🖼️ PNG Image
- Export current map view as image
- High-resolution output
- Perfect for documents and slides

### How to Export

1. Apply any desired **filters**
2. Click the **Export** button in the top-right
3. Select your preferred **format**
4. The file will **download** automatically

---

## Tips and Best Practices

### Data Quality

✅ **Do:**
- Ensure CSV files follow the required schema
- Use consistent date formats (DD-MM-YYYY)
- Validate data before uploading
- Check for missing values

❌ **Don't:**
- Upload files with missing required columns
- Mix different date formats
- Include special characters in location names

### Performance Optimization

For best performance:
- **Large datasets**: The app automatically samples data over 50,000 records
- **Multiple files**: Upload related data together for better analysis
- **Browser storage**: Data persists locally, but clear old datasets if needed

### Analysis Workflow

Recommended workflow for analysis:

1. **Upload** your CSV data
2. **Review** Dashboard for overview
3. **Check** AI Pulse for anomalies
4. **Investigate** unusual patterns
5. **Use** Analytics for trend analysis
6. **Compare** regions of interest
7. **Export** findings for reporting

### Keyboard Shortcuts

- **Esc** - Close open panels
- **Ctrl/Cmd + F** - Focus search bar (when visible)
- **Ctrl/Cmd + R** - Reset filters

---

## Troubleshooting

### Common Issues

**Problem**: Data not loading after upload
- **Solution**: Check CSV format matches schema, refresh page

**Problem**: Map not displaying
- **Solution**: Ensure location data (state, district) is present

**Problem**: Charts showing "No Data"
- **Solution**: Check date range filters, verify data has required fields

**Problem**: Anomaly detection not showing
- **Solution**: Need at least 5 unique districts for statistical analysis

### Getting Help

For additional support:
- Check the repository: https://github.com/Cygnusx-09/Aadhar-Heat-Map
- Review CSV schema: `.agent/csv_schema.md`
- Report issues on GitHub Issues

---

## Technical Information

### Browser Compatibility

Recommended browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Data Storage

- Data is stored locally using **IndexedDB**
- Persists across browser sessions
- No data sent to external servers
- Clear browser data to remove stored datasets

### Privacy & Security

- All processing happens **client-side**
- No data uploaded to servers
- Secure HTTPS connection
- No tracking or analytics

---

## Conclusion

You're now ready to use the India Demographic Heatmap Tool effectively! This powerful application helps you:

✨ Visualize demographic data on interactive maps  
📊 Analyze trends over time  
🔍 Compare different regions  
🤖 Detect data anomalies automatically  
📤 Export professional reports

Happy analyzing! 🎉

---

**Version**: 1.0  
**Last Updated**: January 2026  
**UIDAI Hackathon 2026**
