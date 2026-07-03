import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui";
import { isPersonColorName, personColor } from "@/utils/personColor";

export interface QuickFilterMember {
  name: string;
  color: string;
}

interface QuickFilterProps {
  onFilterChange: (filter: string) => void;
  members: QuickFilterMember[];
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * "Trova me" — the Call Sheet's personalization moment. A floating pill
 * trigger opens an accessible dialog listing every team member (color dot +
 * name); picking one becomes the active QuickFilter name that ShiftCard uses
 * to render the gold "Tu suoni" ribbon and attenuate everyone else.
 */
export default function QuickFilter({ onFilterChange, members }: QuickFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleSearch = (name: string) => {
    setSearchTerm(name);
    onFilterChange(name);
    setIsOpen(false);

    // Visual feedback: scroll to top smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClear = () => {
    setSearchTerm("");
    onFilterChange("");
  };

  // Focus management: move focus into the dialog on open, trap Tab/Shift+Tab
  // inside it, close on Escape/backdrop click, and restore focus to whatever
  // triggered it once it closes.
  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) return;

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previouslyFocused?.focus();
    };
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {!isOpen && !searchTerm && (
        <Button
          onClick={() => setIsOpen(true)}
          aria-label="Trova il mio nome"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          className="min-h-[44px] rounded-pill bg-ink-950 px-5 text-sm text-paper shadow-raised hover:bg-ink-800 hover:shadow-overlay"
        >
          <Search className="h-4 w-4" aria-hidden="true" />
          Trova me
        </Button>
      )}

      {!isOpen && searchTerm && (
        <div
          className="flex min-h-[44px] items-center gap-1 rounded-pill bg-ink-950 py-1.5 pl-4 pr-1.5 text-paper shadow-raised"
          role="status"
          aria-live="polite"
        >
          <span className="text-sm font-medium">Filtro: {searchTerm}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            aria-label="Rimuovi filtro"
            className="h-9 min-h-[44px] w-9 min-w-[44px] rounded-pill p-0 text-paper hover:bg-white/10 hover:text-paper"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-ink-950/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div
            ref={dialogRef}
            className="relative w-72 max-w-[calc(100vw-3rem)] rounded-lg2 bg-surface p-4 shadow-overlay animate-fade-up"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filter-title"
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 id="filter-title" className="font-display text-heading text-ink-950">
                Trova me
              </h3>
              <Button
                ref={closeButtonRef}
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                aria-label="Chiudi"
                className="h-9 min-h-[44px] w-9 min-w-[44px] rounded-pill p-0"
              >
                <X className="h-4 w-4 text-ink-600" aria-hidden="true" />
              </Button>
            </div>
            <div
              className="max-h-72 space-y-1 overflow-y-auto"
              role="listbox"
              aria-label="Membri del team"
            >
              {members.map((member) => {
                const swatch = personColor(
                  isPersonColorName(member.color) ? member.color : "gray"
                );
                return (
                  <button
                    key={member.name}
                    onClick={() => handleSearch(member.name)}
                    role="option"
                    aria-selected={searchTerm === member.name}
                    className="flex min-h-[44px] w-full items-center gap-2.5 rounded-md2 px-3 py-2.5 text-left text-sm font-medium text-ink-800 transition-colors hover:bg-ink-800/5"
                  >
                    <span
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${swatch.dot}`}
                      aria-hidden="true"
                    />
                    {member.name}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
