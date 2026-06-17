import { WorkspaceLayout } from "@/components/workspace/WorkspaceLayout";
import { NovaProvider } from "@/context/NovaContext";

export default function Dashboard() {
  return (
    <NovaProvider>
      <WorkspaceLayout />
    </NovaProvider>
  );
}
