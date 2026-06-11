"use client";

import { useCallback, useRef, useState } from "react";

import { Card } from "@/components/ui/Card";
import type { TodayHoroscope } from "@/lib/horoscope/types";
import { t } from "@/lib/i18n";

const PULL_THRESHOLD_PX = 72;

interface TodayHoroscopeProps {
  initial: TodayHoroscope;
}

export function TodayHoroscopeView({ initial }: TodayHoroscopeProps) {
  const strings = t();
  const [horoscope, setHoroscope] = useState(initial);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const startY = useRef(0);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    setError(null);

    try {
      const response = await fetch("/api/horoscope/today");
      const payload = (await response.json()) as TodayHoroscope & { error?: string };

      if (!response.ok) {
        setError(payload.error ?? strings.today.loadFailed);
        return;
      }

      setHoroscope(payload);
    } catch {
      setError(strings.today.loadFailed);
    } finally {
      setRefreshing(false);
      setPullDistance(0);
      setIsPulling(false);
    }
  }, [strings.today.loadFailed]);

  function handleTouchStart(event: React.TouchEvent<HTMLDivElement>) {
    if (refreshing || window.scrollY > 0) {
      return;
    }

    startY.current = event.touches[0]?.clientY ?? 0;
    setIsPulling(true);
  }

  function handleTouchMove(event: React.TouchEvent<HTMLDivElement>) {
    if (!isPulling || refreshing) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? startY.current;
    const distance = Math.max(0, currentY - startY.current);

    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, PULL_THRESHOLD_PX * 1.5));
    }
  }

  function handleTouchEnd() {
    if (!isPulling) {
      return;
    }

    if (pullDistance >= PULL_THRESHOLD_PX && !refreshing) {
      void refresh();
      return;
    }

    setIsPulling(false);
    setPullDistance(0);
  }

  const showPullHint = pullDistance > 12 && !refreshing;

  return (
    <div
      className="flex flex-col gap-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        transform: pullDistance > 0 ? `translateY(${pullDistance * 0.35}px)` : undefined,
        transition: isPulling ? undefined : "transform 180ms ease-out",
      }}
    >
      {(showPullHint || refreshing) && (
        <p className="text-center text-xs uppercase tracking-widest text-muted">
          {refreshing ? strings.today.refreshing : strings.today.pullToRefresh}
        </p>
      )}

      <Card className="border-foreground/20 p-8">
        <p className="text-lg leading-relaxed md:text-xl">{horoscope.text}</p>
      </Card>

      {horoscope.mainTransitLabel && (
        <Card title={strings.today.mainTransitTitle}>
          <p className="text-base tracking-wide">{horoscope.mainTransitLabel}</p>
        </Card>
      )}

      {error && (
        <div className="flex flex-col gap-2 border border-border p-4">
          <p className="text-sm text-muted">{error}</p>
          <button
            type="button"
            onClick={() => void refresh()}
            className="text-left text-xs uppercase tracking-widest underline underline-offset-4"
          >
            {strings.today.retry}
          </button>
        </div>
      )}
    </div>
  );
}
