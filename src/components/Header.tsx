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
      className={`sticky top-0 z-20 border-b border-line bg-paper/80 backdrop-blur transition-shadow duration-300 ${
        isScrolled ? "shadow-card" : ""
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-3">
        <h1 className="text-center font-display text-heading text-ink-950 tracking-tight">
          {title}
        </h1>
      </div>
    </header>
  );
}
