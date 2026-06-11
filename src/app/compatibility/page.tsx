import { AppLayout } from "@/components/AppLayout";
import { TabPage } from "@/components/TabPage";
import { t } from "@/lib/i18n";

export default function CompatibilityPage() {
  const strings = t();

  return (
    <AppLayout>
      <TabPage title={strings.nav.compatibility} description={strings.compatibility.empty} />
    </AppLayout>
  );
}
