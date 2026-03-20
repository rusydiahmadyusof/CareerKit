"use client";

import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <div className="mb-6 flex justify-center print:hidden">
      <Button onClick={() => window.print()}>Print / Save as PDF</Button>
    </div>
  );
}
