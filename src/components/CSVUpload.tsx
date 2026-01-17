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

                        const record: DemographicRecord = {
                            fileId: fileId,
                            date: row.date,
                            state: row.state,
                            district: row.district,
                            pincode: row.pincode,
                            total_population: age0_5 + age5_17 + age17Plus,
                            lat: row.lat ? parseFloat(row.lat) : undefined,
                            lng: row.lng ? parseFloat(row.lng) : undefined,
                        } as any;

                        // Specific mappings based on file type
                        if (hasBio) {
                            // Biometric file - populate ONLY bio fields
                            record.bio_age_5_17 = parseInt(row.bio_age_5_17);
                            record.bio_age_17_ = parseInt(row.bio_age_17_);
                        } else if (hasEnrol) {
                            // Enrollment file - populate ONLY enrol fields
                            record.enrol_age_0_5 = parseInt(row.age_0_5);
                            record.enrol_age_5_17 = parseInt(row.age_5_17);
                            record.enrol_age_18_ = parseInt(row.age_18_greater);
                        } else if (hasDemo) {
                            // Demographic file - populate ONLY demo fields
                            if (isNaN(age5_17) || isNaN(age17Plus)) {
                                errors.push(`Row ${rowNum}: Invalid age values for demographic file`);
                                return;
                            }
                            record.demo_age_0_5 = age0_5 > 0 ? age0_5 : undefined;
                            record.demo_age_5_17 = age5_17;
                            record.demo_age_17_ = age17Plus;
                        }

                        newRecords.push(record);
                    });

                    if (errors.length > 0) {
                        reject(`File ${file.name}: ${errors[0]}`); // Just show first error for now
                        return;
                    }

                    // Determine file type
                    const fileType = hasBio ? 'biometric' : hasEnrol ? 'enrollment' : 'demographic';

                    // Calculate date range from records
                    const dates = newRecords.map(r => r.date).filter(Boolean).sort((a, b) => {
                        const parseD = (d: string) => {
                            const [day, month, year] = d.split('-').map(Number);
                            return new Date(year, month - 1, day).getTime();
                        };
                        return parseD(a) - parseD(b);
                    });

                    const fileInfo: UploadedFile = {
                        id: fileId,
                        name: file.name,
                        size: file.size,
                        recordCount: newRecords.length,
                        fileType: fileType,
                        dateRange: dates.length > 0 ? {
                            earliest: dates[0],
                            latest: dates[dates.length - 1]
                        } : undefined
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
                    "relative border border-dashed rounded-sm p-8 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group bg-black/50 backdrop-blur-sm",
                    isDragging
                        ? "border-accent-blue bg-accent-blue/5"
                        : "border-white/20 hover:border-accent-blue/50 hover:bg-white/5",
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
                    "w-12 h-12 rounded-full flex items-center justify-center transition-transform duration-300 bg-black border border-white/10",
                    status.type === 'success' ? "text-green-500 border-green-500/50" :
                        status.type === 'error' ? "text-accent-red border-accent-red/50" : "text-white group-hover:scale-110 group-hover:border-accent-blue/50 group-hover:text-accent-blue"
                )}>
                    {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> :
                        status.type === 'success' ? <CheckCircle2 className="w-6 h-6" /> :
                            status.type === 'error' ? <AlertCircle className="w-6 h-6" /> : <Upload className="w-6 h-6" />}
                </div>

                <div>
                    <p className="text-sm font-mono uppercase tracking-wider text-white">
                        {isProcessing ? "PROCESSING..." :
                            status.type === 'success' ? "FILE LOADED" : "UPLOAD CSV"}
                    </p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1 uppercase tracking-wider">
                        {isProcessing ? "VALIDATING RECORDS..." : "DRAG & DROP OR CLICK"}
                    </p>
                </div>

                {/* Tech corners */}
                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/20 group-hover:border-accent-blue/50 transition-colors" />
                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-white/20 group-hover:border-accent-blue/50 transition-colors" />
                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-white/20 group-hover:border-accent-blue/50 transition-colors" />
                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-white/20 group-hover:border-accent-blue/50 transition-colors" />
            </div>

            {/* Error Message */}
            {status.message && status.type === 'error' && (
                <div className="p-3 rounded-sm text-xs font-mono flex gap-2 items-start bg-accent-red/10 text-accent-red border border-accent-red/20 shadow-[0_0_10px_rgba(255,51,51,0.1)]">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span className="whitespace-pre-line uppercase">{status.message}</span>
                </div>
            )}

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
                <div className="space-y-2 mt-4">
                    <h3 className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">Active Files</h3>
                    <div className="space-y-1 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                        {uploadedFiles.map(file => {
                            const typeColors = {
                                demographic: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
                                biometric: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
                                enrollment: 'bg-green-500/20 text-green-400 border-green-500/30'
                            };
                            const typeLabels = { demographic: 'DEMO', biometric: 'BIO', enrollment: 'ENROL' };

                            return (
                                <div key={file.id} className="flex items-center justify-between p-2 rounded-sm border border-white/10 bg-black/50 hover:bg-white/5 transition-colors group">
                                    <div className="flex flex-col overflow-hidden flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${typeColors[file.fileType]}`}>
                                                {typeLabels[file.fileType]}
                                            </span>
                                            <span className="font-mono text-xs text-white truncate uppercase" title={file.name}>{file.name}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-500">{file.recordCount.toLocaleString()} RECORDS</span>
                                    </div>
                                    <button
                                        onClick={() => removeFile(file.id)}
                                        className="p-1 text-gray-500 hover:text-accent-red transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove file"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
