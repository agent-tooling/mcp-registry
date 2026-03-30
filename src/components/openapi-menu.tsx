"use client";

import { Copy, ExternalLink, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPENAPI_URL = "/api/openapi.json";

export function OpenApiMenu() {
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
        <DropdownMenuItem
          onClick={() => {
            const url = new URL(OPENAPI_URL, window.location.origin);
            void navigator.clipboard.writeText(url.toString());
          }}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copy URL
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
