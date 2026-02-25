import { useEffect, useState } from "react";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-slate-800/95 backdrop-blur-md shadow-lg shadow-slate-900/10" 
          : "bg-gradient-to-r from-slate-800 to-slate-700 shadow-lg"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-3">
          <div className="text-center">
            <h1 className="font-display text-display text-white tracking-tight">
              {title}
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
