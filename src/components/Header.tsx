interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white py-6 px-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center">{title}</h1>
      </div>
    </header>
  );
}
