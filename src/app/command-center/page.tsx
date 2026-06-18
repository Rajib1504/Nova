import { CommandCenter } from "@/components/pulse/CommandCenter";
import { NovaProvider } from "@/context/NovaContext";

export default function CommandCenterPage() {
  return (
    <NovaProvider>
      <CommandCenter />
    </NovaProvider>
  );
}
