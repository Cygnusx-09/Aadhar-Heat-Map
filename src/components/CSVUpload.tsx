import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { DemographicRecord, UploadedFile } from '../types';
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { WorkerResponse } from '../workers/csvParser.worker';

// Simple ID generator
const generateId = () => Math.random().toString(36).substring(2, 15);

export function CSVUpload() {
    const { addRawData, uploadedFiles, removeFile } = useStore();
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({
        type: 'idle',
        message: '',
    });

    const workerRef = useRef<Worker | null>(null);
    const pendingUploads = useRef<Map<string, { resolve: () => void, reject: (reason?: any) => void }>>(new Map());

    useEffect(() => {
        // Initialize Web Worker
        workerRef.current = new Worker(new URL('../workers/csvParser.worker.ts', import.meta.url), { type: 'module' });

        workerRef.current.onmessage = (e: MessageEvent<WorkerResponse>) => {
            const { fileId, type } = e.data;
            const resolver = pendingUploads.current.get(fileId);

            if (resolver) {
                if (type === 'success') {
                    // Fix: e.data is discriminated union. If type is success, e.data has data and fileInfo
                    // Typescript might complain if not toggled correctly, but at runtime it works.
                    // Casting to specific type for safety in block
                    const successData = e.data as Extract<WorkerResponse, { type: 'success' }>;
                    addRawData(successData.data, successData.fileInfo);
                    resolver.resolve();
                } else if (type === 'error') {
                    const errorData = e.data as Extract<WorkerResponse, { type: 'error' }>;
                    resolver.reject(errorData.message);
                }
                pendingUploads.current.delete(fileId);
            }
        };

        return () => {
            workerRef.current?.terminate();
        };
    }, [addRawData]);

    const processFile = (file: File) => {
        return new Promise<void>((resolve, reject) => {
            const fileId = generateId();

            if (!workerRef.current) {
                reject("Worker not initialized");
                return;
            }

            pendingUploads.current.set(fileId, { resolve, reject });
            workerRef.current.postMessage({ file, fileId });
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

        // Process sequentially or parallel? 
        // Parallel might overload if many big files, but worker queue handles it. 
        // Let's do parallel for speed since worker is async.

        await Promise.all(fileArray.map(async (file) => {
            try {
                await processFile(file);
                successCount++;
            } catch (err: any) {
                errors.push(err);
            }
        }));

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
