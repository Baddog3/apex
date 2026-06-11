import { AppLayout } from "@/components/AppLayout";
import { TabPage } from "@/components/TabPage";
import { t } from "@/lib/i18n";

export default function ChartPage() {
  const strings = t();

  return (
    <AppLayout>
      <TabPage title={strings.nav.chart} description={strings.chart.empty} />
    </AppLayout>
  );
}
