import { AppLayout } from "@/components/AppLayout";
import { BirthTimeBanner } from "@/components/BirthTimeBanner";
import { TabPage } from "@/components/TabPage";
import { TodayHoroscopeView } from "@/components/today/TodayHoroscope";
import { getProfile } from "@/lib/auth/get-profile";
import { getUser } from "@/lib/auth/get-user";
import { getTodayHoroscope } from "@/lib/horoscope/get-today-horoscope";
import { t } from "@/lib/i18n";

function displayName(
  profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>,
): string | null {
  if (profile.name?.trim()) {
    return profile.name.trim();
  }

  if (profile.sun_sign) {
    const strings = t();
    return (
      strings.astrology.signs[
        profile.sun_sign as keyof typeof strings.astrology.signs
      ] ?? profile.sun_sign
    );
  }

  return null;
}

export default async function TodayPage() {
  const strings = t();
  const user = await getUser();
  const profile = await getProfile();
  const name = profile ? displayName(profile) : null;

  const horoscopeResult = user ? await getTodayHoroscope(user.id) : null;

  return (
    <AppLayout>
      <TabPage title={strings.nav.today}>
        {name && (
          <p className="text-xl font-medium tracking-wide">
            {strings.today.greeting}, {name}
          </p>
        )}

        {horoscopeResult?.ok ? (
          <TodayHoroscopeView initial={horoscopeResult.horoscope} />
        ) : (
          <p className="text-sm leading-relaxed text-muted">
            {horoscopeResult?.error === "persist_failed"
              ? strings.horoscope.generateFailed
              : strings.today.empty}
          </p>
        )}

        {profile && !profile.birth_time && <BirthTimeBanner />}
      </TabPage>
    </AppLayout>
  );
}
