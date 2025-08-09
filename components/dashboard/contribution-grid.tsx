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
    <div className="space-y-4 contribution-grid">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
        <span className="text-sm text-blue-300 font-medium pixelated-text">Your Journal Activity</span>
      </div>
      <div className="flex gap-1 p-4 bg-slate-700/50 rounded-lg border border-slate-600">
        {grid.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                title={day.date.toLocaleDateString() + (day.hasEntry ? ': Journal Entry' : ': No entry')}
                className={`w-3 h-3 rounded-sm
                  ${day.hasEntry 
                    ? 'bg-blue-500' 
                    : 'bg-slate-600'
                  }
                `}
              />
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-blue-300 text-center pixelated-text">
        Each square represents a day. Blue squares show days with journal entries.
      </p>
    </div>
  );
}
