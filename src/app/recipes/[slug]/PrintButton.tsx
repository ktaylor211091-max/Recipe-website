"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 print:hidden"
    >
      Print
    </button>
  );
}
