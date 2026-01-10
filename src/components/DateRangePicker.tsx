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
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase">From</label>
                    <input
                        type="date"
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={formatDate(dateRange.start)}
                        onChange={handleStartChange}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-[10px] text-muted-foreground uppercase">To</label>
                    <input
                        type="date"
                        className="h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        value={formatDate(dateRange.end)}
                        onChange={handleEndChange}
                    />
                </div>
            </div>
            {dateRange.start && dateRange.end && (
                <button
                    onClick={() => setFilters({ dateRange: { start: null, end: null } })}
                    className="text-xs text-primary hover:underline self-end"
                >
                    Clear Filter
                </button>
            )}
        </div>
    );
};

export default DateRangePicker;
