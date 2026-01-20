
import Papa from 'papaparse';
import { DemographicRecord, FileDataType } from '../types';

// Define the shape of the message received from the main thread
interface WorkerMessage {
    file: File;
    fileId: string;
}

// Define the shape of the message sent back to the main thread
export type WorkerResponse =
    | { type: 'success'; data: DemographicRecord[]; fileId: string; fileInfo: { id: string; name: string; size: number; recordCount: number; fileType: FileDataType } }
    | { type: 'error'; message: string; fileId: string; fileName: string };

self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
    const { file, fileId } = e.data;

    try {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const { data, meta } = results;

                // 1. Validation: Check headers
                const headers = meta.fields;
                if (!headers) {
                    self.postMessage({
                        type: 'error',
                        message: `File "${file.name}" is invalid: No headers found.`,
                        fileId,
                        fileName: file.name
                    });
                    return;
                }

                const requiredBase = ['date', 'state', 'district', 'pincode'];
                // Schema 1: Demographic
                const demoCols = ['demo_age_5_17', 'demo_age_17_'];
                // Schema 2: Biometric
                const bioCols = ['bio_age_5_17', 'bio_age_17_'];
                // Schema 3: Enrolment
                const enrolCols = ['age_0_5', 'age_5_17', 'age_18_greater'];

                const hasBase = requiredBase.every(col => headers.includes(col));
                const hasDemo = demoCols.every(col => headers.includes(col));
                const hasBio = bioCols.every(col => headers.includes(col));
                const hasEnrol = enrolCols.every(col => headers.includes(col));

                if (!hasBase || (!hasDemo && !hasBio && !hasEnrol)) {
                    self.postMessage({
                        type: 'error',
                        message: `File "${file.name}" is invalid. Unknown format.`,
                        fileId,
                        fileName: file.name
                    });
                    return;
                }

                const newRecords: DemographicRecord[] = [];
                const errors: string[] = [];

                (data as any[]).forEach((row: any, index) => {
                    if (Object.keys(row).length < 2) return; // Skip empty rows

                    const rowNum = index + 2; // Header is 1

                    // Basic Validation
                    if (!row.state || !row.district) {
                        return;
                    }

                    // Validate date format
                    const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
                    if (!dateRegex.test(row.date)) {
                        errors.push(`Row ${rowNum}: Invalid date "${row.date}".`);
                        return;
                    }

                    if (row.pincode && !/^\d{6}$/.test(row.pincode)) {
                        errors.push(`Row ${rowNum}: Invalid pincode "${row.pincode}".`);
                        return;
                    }

                    // Normalize columns
                    let age0_5 = 0;
                    let age5_17 = 0;
                    let age17Plus = 0;

                    if (hasDemo) {
                        age5_17 = parseInt(row.demo_age_5_17);
                        age17Plus = parseInt(row.demo_age_17_);
                    } else if (hasBio) {
                        age5_17 = parseInt(row.bio_age_5_17);
                        age17Plus = parseInt(row.bio_age_17_);
                    } else if (hasEnrol) {
                        age0_5 = parseInt(row.age_0_5);
                        age5_17 = parseInt(row.age_5_17);
                        age17Plus = parseInt(row.age_18_greater);
                    }

                    if (isNaN(age5_17) || isNaN(age17Plus) || isNaN(age0_5)) {
                        errors.push(`Row ${rowNum}: Numeric counts required for age groups.`);
                        return;
                    }

                    const record: DemographicRecord = {
                        fileId: fileId,
                        date: row.date,
                        state: row.state,
                        district: row.district,
                        pincode: row.pincode,
                        demo_age_0_5: age0_5 > 0 ? age0_5 : undefined,
                        demo_age_5_17: age5_17,
                        demo_age_17_: age17Plus,
                        total_population: age0_5 + age5_17 + age17Plus,
                        lat: row.lat ? parseFloat(row.lat) : undefined,
                        lng: row.lng ? parseFloat(row.lng) : undefined,
                    };

                    if (hasBio) {
                        record.bio_age_5_17 = parseInt(row.bio_age_5_17);
                        record.bio_age_17_ = parseInt(row.bio_age_17_);
                    } else if (hasEnrol) {
                        record.enrol_age_0_5 = parseInt(row.age_0_5);
                        record.enrol_age_5_17 = parseInt(row.age_5_17);
                        record.enrol_age_18_ = parseInt(row.age_18_greater);
                    }

                    newRecords.push(record);
                });

                if (errors.length > 0) {
                    self.postMessage({
                        type: 'error',
                        message: `File ${file.name}: ${errors[0]}`,
                        fileId,
                        fileName: file.name
                    });
                    return;
                }

                // Determine file type based on detected schema
                let fileType: FileDataType = 'demographic';
                if (hasBio) {
                    fileType = 'biometric';
                } else if (hasEnrol) {
                    fileType = 'enrollment';
                }

                const fileInfo = {
                    id: fileId,
                    name: file.name,
                    size: file.size,
                    recordCount: newRecords.length,
                    fileType
                };

                self.postMessage({
                    type: 'success',
                    data: newRecords,
                    fileId,
                    fileInfo
                });
            },
            error: (error) => {
                self.postMessage({
                    type: 'error',
                    message: `File ${file.name}: Parse error: ${error.message}`,
                    fileId,
                    fileName: file.name
                });
            },
        });
    } catch (err: any) {
        self.postMessage({
            type: 'error',
            message: `Worker error: ${err.message}`,
            fileId,
            fileName: file.name
        });
    }
};
