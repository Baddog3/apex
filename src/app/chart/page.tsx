import { AppLayout } from "@/components/AppLayout";
import { BirthTimeBanner } from "@/components/BirthTimeBanner";
import { ChartView } from "@/components/chart/ChartView";
import { TabPage } from "@/components/TabPage";
import { getProfile } from "@/lib/auth/get-profile";
import { getUser } from "@/lib/auth/get-user";
import { getChartAccess } from "@/lib/chart/access";
import { getUserNatalChart } from "@/lib/chart/get-user-natal-chart";
import { t } from "@/lib/i18n";

export default async function ChartPage() {
  const strings = t();
  const user = await getUser();
  const profile = await getProfile();
  const chart = user ? await getUserNatalChart(user.id) : null;
  const access = getChartAccess(
    profile?.subscription_tier ?? "free",
    chart?.hasBirthTime ?? false,
  );

  return (
    <AppLayout>
      <TabPage title={strings.nav.chart}>
        {chart ? (
          <ChartView chart={chart} access={access} />
        ) : (
          <p className="text-sm leading-relaxed text-muted">{strings.chart.empty}</p>
        )}

        {profile && !profile.birth_time && <BirthTimeBanner />}
      </TabPage>
    </AppLayout>
  );
}
