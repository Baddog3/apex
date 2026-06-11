import { Suspense } from "react";

import { LoginForm } from "./login-form";
import { TelegramLogin } from "./telegram-login";
import { t } from "@/lib/i18n";

export default function LoginPage() {
  const strings = t();

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        <header className="mb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-muted">{strings.app.name}</p>
          <h1 className="mt-3 text-2xl font-medium uppercase tracking-widest">
            {strings.auth.loginTitle}
          </h1>
          <p className="mt-2 text-sm text-muted">{strings.auth.loginSubtitle}</p>
        </header>
        <Suspense>
          <LoginForm />
        </Suspense>
        <div className="mt-10 flex flex-col gap-6">
          <p className="text-center text-xs uppercase tracking-widest text-muted">
            {strings.auth.orDivider}
          </p>
          <TelegramLogin />
        </div>
      </div>
    </main>
  );
}
