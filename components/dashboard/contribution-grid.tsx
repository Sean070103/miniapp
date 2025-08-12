import React from 'react';

interface DailyEntry {
  id: string;
  date: string;
  content: string;
  tags: string[];
  timestamp: number;
}

interface ContributionGridProps {
  entries: DailyEntry[];
  weeks?: number; // default 20
}

function getDateKey(date: Date) {
  return date.toISOString().split('T')[0];
}

export function ContributionGrid({ entries, weeks = 20 }: ContributionGridProps) {
  // Build a set of entry dates for quick lookup
  const entryDates = new Set(entries.map(e => e.date));

  // Find the last Sunday (GitHub grids start on Sunday)
  const today = new Date();
  const lastSunday = new Date(today);
  lastSunday.setDate(today.getDate() - today.getDay());

  // Build grid: weeks x 7 days
  const grid: { date: Date; hasEntry: boolean }[][] = [];
  for (let w = weeks - 1; w >= 0; w--) {
    const week: { date: Date; hasEntry: boolean }[] = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(lastSunday);
      date.setDate(lastSunday.getDate() - w * 7 + d);
      const key = getDateKey(date);
      week.push({ date, hasEntry: entryDates.has(key) });
    }
    grid.push(week);
  }

  return (
    <div className="contribution-grid">
      <div className="flex gap-1 justify-center">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => {
              const isToday = getDateKey(day.date) === getDateKey(today);
              return (
                <div
                  key={di}
                  title={`${day.date.toLocaleDateString()}${day.hasEntry ? ': Journal Entry' : ': No entry'}${isToday ? ' (Today)' : ''}`}
                  className={`w-4 h-4 rounded-sm transition-all duration-200 hover:scale-110 cursor-pointer
                    ${day.hasEntry 
                      ? isToday
                        ? 'bg-blue-400 border border-blue-300 shadow-sm'
                        : 'bg-blue-500 hover:bg-blue-400'
                      : isToday
                        ? 'bg-slate-500 border border-slate-400'
                        : 'bg-slate-600 hover:bg-slate-500'
                    }
                  `}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
