import { Search, X } from "lucide-react";
import { useState } from "react";

interface QuickFilterProps {
  onFilterChange: (filter: string) => void;
  memberNames: string[];
}

export default function QuickFilter({ onFilterChange, memberNames }: QuickFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (name: string) => {
    setSearchTerm(name);
    onFilterChange(name);
    setIsOpen(false);
    
    // Visual feedback: scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClear = () => {
    setSearchTerm("");
    onFilterChange("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && !searchTerm && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Trova il mio nome"
          className="flex items-center gap-2 px-5 py-3 bg-slate-700 hover:bg-slate-800 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-medium text-sm min-h-[44px] min-w-[44px]"
        >
          <Search className="w-4 h-4" aria-hidden="true" />
          Trova me
        </button>
      )}

      {searchTerm && (
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-full shadow-lg min-h-[44px]" role="status" aria-live="polite">
          <span className="text-sm font-medium">Filtro: {searchTerm}</span>
          <button
            onClick={handleClear}
            aria-label="Rimuovi filtro"
            className="p-2 hover:bg-white/20 rounded-full transition-colors min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div 
            className="relative bg-white rounded-2xl shadow-2xl p-4 w-64 animate-fade-up"
            role="dialog"
            aria-labelledby="filter-title"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 id="filter-title" className="font-semibold text-zinc-800">Filtra per nome</h3>
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Chiudi filtro"
                className="p-2 hover:bg-zinc-100 rounded-full transition-colors min-h-[44px] min-w-[44px]"
              >
                <X className="w-4 h-4 text-zinc-600" aria-hidden="true" />
              </button>
            </div>
            <div className="space-y-1 max-h-64 overflow-y-auto" role="listbox" aria-label="Membri del team">
              {memberNames.map((name) => (
                <button
                  key={name}
                  onClick={() => handleSearch(name)}
                  role="option"
                  aria-selected={searchTerm === name}
                  className="w-full text-left px-3 py-3 rounded-lg hover:bg-zinc-100 transition-colors text-sm text-zinc-700 font-medium min-h-[44px]"
                >
                  {name}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
