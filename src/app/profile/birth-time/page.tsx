import { AppLayout } from "@/components/AppLayout";
import { t } from "@/lib/i18n";

import { BirthTimeForm } from "./birth-time-form";

export default function BirthTimePage() {
  const strings = t();

  return (
    <AppLayout>
      <div className="mx-auto flex w-full max-w-sm flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium uppercase tracking-widest">
            {strings.birthTime.pageTitle}
          </h1>
          <p className="text-sm leading-relaxed text-muted">
            {strings.birthTime.pageDescription}
          </p>
        </header>
        <BirthTimeForm />
      </div>
    </AppLayout>
  );
}
