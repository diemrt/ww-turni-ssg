import { ChevronDown, Calendar } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface DateNavigationProps {
  shiftsCount: number;
  upcomingCount: number;
}

export default function DateNavigation({ shiftsCount, upcomingCount }: DateNavigationProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const todayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to today on mount if exists
    const today = new Date().toISOString().split('T')[0];
    const todayElement = document.querySelector(`[data-date="${today}"]`);
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  const scrollToToday = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayElement = document.querySelector(`[data-date="${today}"]`);
    if (todayElement) {
      todayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Visual feedback pulse
      todayElement.classList.add('ring-2', 'ring-accent-info', 'ring-offset-2');
      setTimeout(() => {
        todayElement.classList.remove('ring-2', 'ring-accent-info', 'ring-offset-2');
      }, 2000);
    }
  };

  return (
    <div className="mb-6 space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-xl shadow-sm border border-zinc-200">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-100 rounded-lg">
            <Calendar className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">
              {shiftsCount} {shiftsCount === 1 ? "turno" : "turni"}
            </p>
            <p className="text-xs text-zinc-500">
              {upcomingCount} {upcomingCount === 1 ? "prossimo" : "prossimi"}
            </p>
          </div>
        </div>
        
        <button
          onClick={scrollToToday}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px]"
        >
          Oggi
        </button>
      </div>
    </div>
  );
}
