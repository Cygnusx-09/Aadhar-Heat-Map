# Aadhaar CSV File Schema Documentation

This document defines the expected CSV file formats for the India Demographic Heatmap Tool.

## Supported File Types

The tool supports three types of Aadhaar activity data files:

1. **Demographic Update Files** (`*demographic*.csv`)
2. **Biometric Update Files** (`*biometric*.csv`)
3. **Enrollment Files** (`*enrollment*.csv` or `*enrolment*.csv`)

---

## 1. Demographic Update Files

**Purpose**: Tracks demographic information update activities (address changes, name corrections, etc.)

### Required Columns

| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| `date` | String (DD-MM-YYYY) | Date of activity | `01-03-2025` |
| `state` | String | State name | `Uttar Pradesh` |
| `district` | String | District name | `Gorakhpur` |
| `pincode` | String/Number | PIN code | `273213` |
| `demo_age_5_17` | Integer | Updates for age group 5-17 years | `49` |
| `demo_age_17_` | Integer | Updates for age group 17+ years | `529` |

### Optional Columns

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| `lat` | Float | Latitude coordinate |
| `lng` | Float | Longitude coordinate |

### Example Row
```csv
date,state,district,pincode,demo_age_5_17,demo_age_17_
01-03-2025,Uttar Pradesh,Gorakhpur,273213,49,529
```

---

## 2. Biometric Update Files

**Purpose**: Tracks biometric capture and update activities (fingerprint, iris scan updates)

### Required Columns

| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| `date` | String (DD-MM-YYYY) | Date of activity | `01-03-2025` |
| `state` | String | State name | `Haryana` |
| `district` | String | District name | `Mahendragarh` |
| `pincode` | String/Number | PIN code | `123029` |
| `bio_age_5_17` | Integer | Biometric updates for age 5-17 | `280` |
| `bio_age_17_` | Integer | Biometric updates for age 17+ | `577` |

### Optional Columns

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| `lat` | Float | Latitude coordinate |
| `lng` | Float | Longitude coordinate |

### Example Row
```csv
date,state,district,pincode,bio_age_5_17,bio_age_17_
01-03-2025,Haryana,Mahendragarh,123029,280,577
```

---

## 3. Enrollment Files

**Purpose**: Tracks new Aadhaar enrollment activities

### Required Columns

| Column Name | Data Type | Description | Example |
|------------|-----------|-------------|---------|
| `date` | String (DD-MM-YYYY) | Date of enrollment | `01-03-2025` |
| `state` | String | State name | `Maharashtra` |
| `district` | String | District name | `Mumbai` |
| `pincode` | String/Number | PIN code | `400001` |
| `age_0_5` | Integer | Enrollments for age 0-5 years | `15` |
| `age_5_17` | Integer | Enrollments for age 5-17 years | `120` |
| `age_18_greater` | Integer | Enrollments for age 18+ years | `250` |

### Optional Columns

| Column Name | Data Type | Description |
|------------|-----------|-------------|
| `lat` | Float | Latitude coordinate |
| `lng` | Float | Longitude coordinate |

### Example Row
```csv
date,state,district,pincode,age_0_5,age_5_17,age_18_greater
01-03-2025,Maharashtra,Mumbai,400001,15,120,250
```

---

## File Detection Logic

The tool automatically detects file type based on column names:

1. **Biometric Files**: Detected by presence of `bio_age_5_17` and `bio_age_17_` columns
2. **Enrollment Files**: Detected by presence of `age_0_5`, `age_5_17`, or `age_18_greater` columns
3. **Demographic Files**: Detected by presence of `demo_age_5_17` and `demo_age_17_` columns (and absence of bio/enrol columns)

---

## Data Processing Rules

### Parsing Logic

1. **Date Format**: Must be `DD-MM-YYYY` format (e.g., `01-03-2025`)
2. **Numeric Validation**: All age group columns must contain valid integers
3. **Geographic Data**: State and district names are used for mapping to GeoJSON boundaries
4. **PIN Code**: Used for location accuracy and drill-down analysis

### Data Storage

Each record is stored with:
- **File Type Specific Fields**: Only the relevant age group fields for that file type are populated
- **Common Fields**: Date, state, district, pincode, total_population, lat, lng are always present
- **Total Population**: Calculated as sum of all age group values

### Trend Analysis

The tool uses specific field presence to classify data:
- Charts show separate lines for `Demo 5-17`, `Demo 17+`, `Bio 5-17`, `Bio 17+`, `Enrol 0-5`, `Enrol 5-17`, `Enrol 18+`
- File type is determined by which specific fields are populated (not by filename)

---

## Common Issues & Solutions

### Issue: Biometric data showing as zero
**Cause**: File has wrong column names or mixed field types  
**Solution**: Ensure biometric files use `bio_age_5_17` and `bio_age_17_` exactly

### Issue: Multiple file types mixed
**Cause**: CSV contains columns from multiple file types  
**Solution**: Separate data into distinct files per type

### Issue: Date parsing errors
**Cause**: Date format doesn't match DD-MM-YYYY  
**Solution**: Convert dates to DD-MM-YYYY format before upload

---

## Recommendations for Data Quality

1. **Separate Files**: Keep each activity type (demographic, biometric, enrollment) in separate CSV files
2. **Consistent Naming**: Use descriptive file names like `aadhar_biometric_march2025.csv`
3. **Clean Data**: Remove any rows with missing required columns
4. **Validate Dates**: Ensure all dates follow DD-MM-YYYY format
5. **Check Numeric Fields**: Ensure age group columns contain only non-negative integers
