/**
 * Placeholder shell for the admin editor (`#/admin`).
 *
 * This component will be filled in by later issues (month selector, grid,
 * absences, counts panel, draft/export/import — see
 * docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 6).
 *
 * Not linked from the public view; reachable only by navigating directly to
 * `#/admin` (no auth, by design — see sez. 4).
 */
function AdminEditor() {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900">Editor turni (admin)</h1>
      <p className="mt-2 text-zinc-600">
        Questa sezione sarà completata nelle prossime issue.
      </p>
    </div>
  );
}

export default AdminEditor;
