import { AppLayout } from "@/components/AppLayout";
import { BirthTimeBanner } from "@/components/BirthTimeBanner";
import { TabPage } from "@/components/TabPage";
import { getProfile } from "@/lib/auth/get-profile";
import { t } from "@/lib/i18n";

export default async function ChartPage() {
  const profile = await getProfile();
  const strings = t();

  return (
    <AppLayout>
      <TabPage title={strings.nav.chart} description={strings.chart.empty}>
        {profile && !profile.birth_time && <BirthTimeBanner />}
      </TabPage>
    </AppLayout>
  );
}
