import { openDB, DBSchema } from 'idb';
import { DemographicRecord, UploadedFile } from '../types';

interface HeatmapDB extends DBSchema {
    datasets: {
        key: string;
        value: {
            id: string;
            fileInfo: UploadedFile;
            records: DemographicRecord[];
            timestamp: number;
        };
        indexes: { 'by-date': number };
    };
}

const DB_NAME = 'aadhaar-heatmap-db';
const DB_VERSION = 1;

export const dbPromise = openDB<HeatmapDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
        const store = db.createObjectStore('datasets', { keyPath: 'id' });
        store.createIndex('by-date', 'timestamp');
    },
});

export const dbOperations = {
    async saveDataset(fileInfo: UploadedFile, records: DemographicRecord[]) {
        const db = await dbPromise;
        await db.put('datasets', {
            id: fileInfo.id,
            fileInfo,
            records,
            timestamp: Date.now(),
        });
    },

    async getAllDatasets() {
        const db = await dbPromise;
        return db.getAll('datasets');
    },

    async deleteDataset(id: string) {
        const db = await dbPromise;
        await db.delete('datasets', id);
    },

    async clearAll() {
        const db = await dbPromise;
        await db.clear('datasets');
    }
};
