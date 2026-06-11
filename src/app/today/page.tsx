import { AppLayout } from "@/components/AppLayout";
import { TabPage } from "@/components/TabPage";
import { getUser } from "@/lib/auth";
import { t } from "@/lib/i18n";

export default async function TodayPage() {
  const user = await getUser();
  const strings = t();

  return (
    <AppLayout>
      <TabPage title={strings.nav.today} description={strings.today.empty}>
        {user?.email && (
          <p className="text-sm text-muted">
            {strings.today.greeting}, {user.email}
          </p>
        )}
      </TabPage>
    </AppLayout>
  );
}
