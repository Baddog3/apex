"use client";

import { useEffect, useId, useRef, useState } from "react";

import type { GeocodeResult } from "@/lib/geocoding";
import { t } from "@/lib/i18n";

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

interface CityInputProps {
  label?: string;
  value: string;
  error?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSelect: (result: GeocodeResult) => void;
}

export function CityInput({
  label,
  value,
  error,
  disabled = false,
  onChange,
  onSelect,
}: CityInputProps) {
  const strings = t();
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    const trimmed = value.trim();

    if (trimmed.length < MIN_QUERY_LENGTH) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsLoading(true);
      setSearchError(null);

      try {
        const response = await fetch("/api/geocode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          results?: GeocodeResult[];
          error?: string;
        };

        if (!response.ok) {
          setResults([]);
          setSearchError(payload.error ?? strings.geocoding.searchFailed);
          return;
        }

        setResults(payload.results ?? []);
        setIsOpen(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          return;
        }
        setResults([]);
        setSearchError(strings.geocoding.searchFailed);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [value, strings.geocoding.searchFailed]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInputChange(nextValue: string) {
    onChange(nextValue);
    setIsOpen(true);

    if (nextValue.trim().length < MIN_QUERY_LENGTH) {
      setResults([]);
      setSearchError(null);
      setIsLoading(false);
    }
  }

  function handleSelect(result: GeocodeResult) {
    onChange(result.name);
    onSelect(result);
    setResults([]);
    setIsOpen(false);
    setSearchError(null);
  }

  const inputId = label?.toLowerCase().replace(/\s+/g, "-") ?? "city";
  const displayError = error ?? searchError ?? undefined;
  const trimmedValue = value.trim();
  const showNoResults =
    isOpen &&
    !isLoading &&
    trimmedValue.length >= MIN_QUERY_LENGTH &&
    results.length === 0 &&
    !searchError;

  return (
    <div ref={containerRef} className="relative flex flex-col gap-2">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs uppercase tracking-widest text-muted"
        >
          {label}
        </label>
      )}

      <input
        id={inputId}
        type="text"
        role="combobox"
        aria-expanded={isOpen && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        autoComplete="off"
        disabled={disabled}
        value={value}
        placeholder={strings.geocoding.placeholder}
        onChange={(event) => handleInputChange(event.target.value)}
        onFocus={() => {
          if (results.length > 0) {
            setIsOpen(true);
          }
        }}
        className={[
          "w-full border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted outline-none transition-colors focus:border-foreground",
          displayError ? "border-red-500" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      />

      {isLoading && trimmedValue.length >= MIN_QUERY_LENGTH && (
        <p className="text-xs text-muted">{strings.geocoding.searching}</p>
      )}

      {displayError && <p className="text-xs text-red-400">{displayError}</p>}

      {isOpen && results.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute top-full z-20 mt-1 max-h-56 w-full overflow-y-auto border border-border bg-background"
        >
          {results.map((result) => (
            <li key={result.id} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={false}
                className="flex w-full flex-col gap-0.5 px-4 py-3 text-left text-sm transition-colors hover:bg-foreground/5"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => handleSelect(result)}
              >
                <span>{result.name}</span>
                {result.subtitle && (
                  <span className="text-xs text-muted">{result.subtitle}</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      )}

      {showNoResults && (
        <p className="text-xs text-muted">{strings.geocoding.noResults}</p>
      )}
    </div>
  );
}
