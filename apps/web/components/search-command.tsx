"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";

interface SearchEntry {
  id: string;
  type: "article" | "course" | "chapter";
  title: string;
  content: string;
  summary: string;
  url: string;
}

const typeLabels: Record<string, string> = {
  article: "文章",
  course: "课程",
  chapter: "章节",
};

export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchEntry[]>([]);
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search index lazily
  useEffect(() => {
    if (!open || index) return;
    fetch("/search-index.json")
      .then((res) => res.json())
      .then((data: SearchEntry[]) => setIndex(data))
      .catch(() => setIndex([]));
  }, [open, index]);

  // Search
  useEffect(() => {
    if (!index || !query.trim()) {
      setResults([]);
      setSelectedIdx(0);
      return;
    }

    const q = query.toLowerCase();
    const matched = index
      .filter(
        (entry) =>
          entry.title.toLowerCase().includes(q) ||
          entry.summary.toLowerCase().includes(q) ||
          entry.content.toLowerCase().includes(q)
      )
      .slice(0, 10);

    setResults(matched);
    setSelectedIdx(0);
  }, [query, index]);

  // Keyboard shortcut: Cmd+K
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  // Focus input when dialog opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [open]);

  const navigate = useCallback(
    (url: string) => {
      setOpen(false);
      router.push(url);
    },
    [router]
  );

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && results[selectedIdx]) {
      e.preventDefault();
      navigate(results[selectedIdx].url);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />

      {/* Dialog */}
      <div className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2 rounded-xl border bg-popover shadow-2xl">
        {/* Search input */}
        <div className="flex items-center border-b px-4">
          <svg
            className="mr-2 h-4 w-4 shrink-0 text-muted-foreground"
            viewBox="0 0 15 15"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 6.5C10 8.433 8.433 10 6.5 10C4.567 10 3 8.433 3 6.5C3 4.567 4.567 3 6.5 3C8.433 3 10 4.567 10 6.5ZM9.30884 10.0159C8.53901 10.6318 7.56251 11 6.5 11C4.01472 11 2 8.98528 2 6.5C2 4.01472 4.01472 2 6.5 2C8.98528 2 11 4.01472 11 6.5C11 7.56251 10.6318 8.53901 10.0159 9.30884L12.8536 12.1464C13.0488 12.3417 13.0488 12.6583 12.8536 12.8536C12.6583 13.0488 12.3417 13.0488 12.1464 12.8536L9.30884 10.0159Z"
              fill="currentColor"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="搜索文章、课程..."
            className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden sm:inline-flex pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[300px] overflow-y-auto p-2">
          {query && results.length === 0 && index && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              没有找到相关结果
            </p>
          )}

          {results.length > 0 && (
            <div className="space-y-1">
              {results.map((entry, i) => (
                <button
                  key={entry.id}
                  onClick={() => navigate(entry.url)}
                  className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    i === selectedIdx
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-accent/50"
                  }`}
                >
                  <span className="shrink-0 text-xs text-muted-foreground px-1.5 py-0.5 rounded bg-muted">
                    {typeLabels[entry.type] ?? entry.type}
                  </span>
                  <div className="flex-1 truncate">
                    <div className="font-medium truncate">{entry.title}</div>
                    {entry.summary && (
                      <div className="text-xs text-muted-foreground truncate">
                        {entry.summary}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {!query && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              输入关键词搜索...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
