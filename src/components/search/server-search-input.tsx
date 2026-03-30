import { Suspense } from "react";

import { Input } from "@/components/ui/input";
import { ServerSearchInputClient } from "./server-search-input-client";

type ServerSearchInputProps = {
  placeholder?: string;
  className?: string;
};

export function ServerSearchInput({
  placeholder = "Search servers (e.g. github, filesystem)",
  className,
}: ServerSearchInputProps) {
  return (
    <Suspense
      fallback={
        <Input
          placeholder={placeholder}
          className={className}
          disabled
          aria-label="Search servers"
        />
      }
    >
      <ServerSearchInputClient
        placeholder={placeholder}
        className={className}
      />
    </Suspense>
  );
}
