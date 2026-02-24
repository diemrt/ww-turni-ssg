export default function LoadingState() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-zinc-200 rounded-lg" />
              <div className="h-6 bg-zinc-200 rounded w-32" />
            </div>
            <div className="space-y-3">
              <div className="h-12 bg-zinc-100 rounded-lg" />
              <div className="h-12 bg-zinc-100 rounded-lg" />
              <div className="h-12 bg-zinc-100 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
