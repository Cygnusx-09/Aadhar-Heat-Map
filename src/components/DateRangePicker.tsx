import React from 'react';
import { useStore } from '../store/useStore';

const DateRangePicker: React.FC = () => {
    const { dateRange, setFilters } = useStore();

    const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        setFilters({ dateRange: { ...dateRange, start: date } });
    };

    const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const date = e.target.value ? new Date(e.target.value) : null;
        setFilters({ dateRange: { ...dateRange, end: date } });
    };

    const formatDate = (date: Date | null) => {
        if (!date) return '';
        // Date input expects yyyy-MM-dd
        const yyyy = date.getFullYear();
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    return (
        <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">From</label>
                    <input
                        type="date"
                        className="h-8 w-full rounded-sm border border-white/10 bg-black px-2 py-1 text-xs font-mono text-white shadow-none transition-colors focus-visible:outline-none focus-visible:border-accent-blue/50"
                        value={formatDate(dateRange.start)}
                        onChange={handleStartChange}
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase text-gray-500 tracking-wider">To</label>
                    <input
                        type="date"
                        className="h-8 w-full rounded-sm border border-white/10 bg-black px-2 py-1 text-xs font-mono text-white shadow-none transition-colors focus-visible:outline-none focus-visible:border-accent-blue/50"
                        value={formatDate(dateRange.end)}
                        onChange={handleEndChange}
                    />
                </div>
            </div>
            {dateRange.start && dateRange.end && (
                <button
                    onClick={() => setFilters({ dateRange: { start: null, end: null } })}
                    className="text-[10px] font-mono uppercase text-accent-red hover:underline self-end tracking-wider"
                >
                    Clear Filter
                </button>
            )}
        </div>
    );
};

export default DateRangePicker;
