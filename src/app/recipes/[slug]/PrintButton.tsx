"use client";

import { Button } from "@/components";

export function PrintButton() {
  return (
    <Button
      onClick={() => window.print()}
      variant="outline"
      size="md"
      className="print:hidden"
    >
      Print
    </Button>
  );
}
