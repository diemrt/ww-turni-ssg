import { CalendarOff } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  message?: string;
}

export default function EmptyState({ 
  title = "Nessun turno disponibile", 
  message = "I turni verranno aggiunti presto" 
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4 animate-fade-in">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 mb-4">
        <CalendarOff className="w-8 h-8 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">{title}</h3>
      <p className="text-zinc-500 text-sm max-w-sm mx-auto">{message}</p>
    </div>
  );
}
