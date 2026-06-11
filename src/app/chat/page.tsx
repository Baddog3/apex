import { AppLayout } from "@/components/AppLayout";
import { TabPage } from "@/components/TabPage";
import { t } from "@/lib/i18n";

export default function ChatPage() {
  const strings = t();

  return (
    <AppLayout>
      <TabPage title={strings.nav.chat} description={strings.chat.empty} />
    </AppLayout>
  );
}
