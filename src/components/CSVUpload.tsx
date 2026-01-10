import React, { useCallback, useState } from 'react';
import Papa from 'papaparse';
import { useStore } from '../store/useStore';
import { DemographicRecord, UploadedFile } from '../types';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';

// Simple ID generator if we don't want to add uuid package just for this
const generateId = () => Math.random().toString(36).substring(2, 15);

export function CSVUpload() {
    const { addRawData, uploadedFiles, removeFile } = useStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
        type: 'idle',
        message: '',
    });

    const processFile = (file: File) => {
        return new Promise<void>((resolve, reject) => {
            const fileId = generateId();

            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    const { data, meta } = results;
                    // Exact headers from user's sample
                    // 1. Validation: Check headers
                    const headers = results.meta.fields;
                    if (!headers) {
                        reject(`File "${file.name}" is invalid: No headers found.`);
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
                        reject(`File "${file.name}" is invalid. Unknown format.`);
                        return;
                    }

                    const newRecords: DemographicRecord[] = [];
                    const errors: string[] = [];

                    (data as any[]).forEach((row: any, index) => {
                        if (Object.keys(row).length < 2) return; // Skip empty rows

                        const rowNum = index + 2; // Header is 1

                        // Basic Validation
                        if (!row.state || !row.district) {
                            // Optional: log skip
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

                        newRecords.push({
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
                        });
                    });

                    if (errors.length > 0) {
                        reject(`File ${file.name}: ${errors[0]}`); // Just show first error for now
                        return;
                    }

                    const fileInfo: UploadedFile = {
                        id: fileId,
                        name: file.name,
                        size: file.size,
                        recordCount: newRecords.length
                    };

                    addRawData(newRecords, fileInfo);
                    resolve();
                },
                error: (error) => {
                    reject(`File ${file.name}: Parse error: ${error.message}`);
                },
            });
        });
    };

    const handleFiles = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        setIsProcessing(true);
        setStatus({ type: 'idle', message: '' });

        const fileArray = Array.from(files).filter(f => f.type === 'text/csv');

        if (fileArray.length === 0) {
            setStatus({ type: 'error', message: 'No valid CSV files found.' });
            setIsProcessing(false);
            return;
        }

        const errors: string[] = [];
        let successCount = 0;

        for (const file of fileArray) {
            try {
                await processFile(file);
                successCount++;
            } catch (err: any) {
                errors.push(err);
            }
        }

        setIsProcessing(false);

        if (errors.length > 0) {
            setStatus({
                type: 'error',
                message: `Processed ${successCount}/${fileArray.length} files.\nErrors:\n${errors.join('\n')}`
            });
        } else {
            setStatus({
                type: 'success',
                message: `Successfully loaded ${successCount} file(s).`
            });
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };

    return (
        <div className="space-y-4">
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={cn(
                    "relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group",
                    isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20 hover:border-primary/50 hover:bg-muted/30",
                    isProcessing && "pointer-events-none opacity-60"
                )}
                onClick={() => document.getElementById('csv-input')?.click()}
            >
                <input
                    id="csv-input"
                    type="file"
                    accept=".csv"
                    multiple // Allow multiple
                    className="hidden"
                    onChange={handleFileChange}
                />

                <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300",
                    status.type === 'success' ? "bg-green-100 text-green-600" :
                        status.type === 'error' ? "bg-red-100 text-red-600" : "bg-primary/10 text-primary group-hover:scale-110"
                )}>
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> :
                        status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                            status.type === 'error' ? <AlertCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>

                <div>
                    <p className="text-sm font-semibold">
                        {isProcessing ? "Processing data..." :
                            status.type === 'success' ? "File loaded!" : "Click to upload CSV(s)"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {isProcessing ? "Validating records..." : "Supports single or multiple files"}
                    </p>
                </div>
            </div>

            {/* Error Message */}
            {status.message && status.type === 'error' && (
                <div className="p-3 rounded-lg text-xs font-medium flex gap-2 items-start bg-red-50 text-red-700 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="whitespace-pre-line">{status.message}</span>
                </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                    <h3 className="text-xs font-semibold uppercase text-muted-foreground">Uploaded Files</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                        {uploadedFiles.map(file => (
                            <div key={file.id} className="flex items-center justify-between p-2 rounded-md border bg-background text-sm">
                                <div className="flex flex-col overflow-hidden">
                                    <span className="font-medium truncate" title={file.name}>{file.name}</span>
                                    <span className="text-[10px] text-muted-foreground">{file.recordCount} records</span>
                                </div>
                                <button
                                    onClick={() => removeFile(file.id)}
                                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                    title="Remove file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
