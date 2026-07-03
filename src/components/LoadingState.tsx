interface LoadingStateProps {
  /** Text shown under the spinner. Defaults to the generic loading copy used
   * by both PublicView and AdminEditor while their config/turni fetch is in
   * flight. */
  message?: string;
}

/**
 * Full-page centered spinner, shared by PublicView and AdminEditor's loading
 * state so the markup isn't duplicated across both entry points.
 */
export default function LoadingState({ message = "Caricamento..." }: LoadingStateProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block w-8 h-8 border-4 border-slate-700 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-zinc-600">{message}</p>
      </div>
    </div>
  );
}
