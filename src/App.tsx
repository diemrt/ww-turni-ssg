import { useHashRoute } from "@/hooks/useHashRoute";
import PublicView from "@/components/PublicView";
import AdminEditor from "@/components/admin/AdminEditor";

/**
 * Dispatches on the hash route (see
 * docs/superpowers/specs/2026-07-02-admin-editor-turni-design.md sez. 4):
 * - `#/admin` -> AdminEditor.
 * - `#/`, empty, or anything else -> PublicView (existing behavior).
 *
 * The admin route is not linked from the public view and has no auth
 * protection — a conscious design choice documented in the spec.
 */
function App() {
  const route = useHashRoute();

  if (route === "/admin") {
    return <AdminEditor />;
  }

  return <PublicView />;
}

export default App;
