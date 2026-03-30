"use client";

import { Copy, ExternalLink, FileJson } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPENAPI_URL = "/api/openapi.json";

export function OpenApiMenu() {
  async function handleCopyContent() {
    try {
      const res = await fetch(OPENAPI_URL);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      toast.success("OpenAPI spec copied to clipboard");
    } catch {
      toast.error("Failed to copy OpenAPI spec");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileJson className="h-4 w-4" />
          OpenAPI Spec
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem asChild>
          <a href={OPENAPI_URL} target="_blank" rel="noreferrer">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => void handleCopyContent()}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Content
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
