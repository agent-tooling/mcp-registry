"use client";

import { useTransition } from "react";
import { parseAsInteger, parseAsString, useQueryState } from "nuqs";

import { Input } from "@/components/ui/input";

type ServerSearchInputClientProps = {
  placeholder?: string;
  className?: string;
};

export function ServerSearchInputClient({
  placeholder = "Search servers (e.g. github, filesystem)",
  className,
}: ServerSearchInputClientProps) {
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString
      .withDefault("")
      .withOptions({ history: "replace", shallow: false }),
  );
  const [, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(0).withOptions({
      history: "replace",
      shallow: false,
    }),
  );

  function handleChange(value: string) {
    startTransition(() => {
      void setSearch(value || null);
      void setPage(null);
    });
  }

  return (
    <Input
      value={search}
      onChange={(event) => handleChange(event.target.value)}
      placeholder={placeholder}
      className={className}
      data-pending={isPending ? "true" : "false"}
    />
  );
}
