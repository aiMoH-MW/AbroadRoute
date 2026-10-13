import type { ReactNode } from "react";

// Placeholder for a value missing from the database
export function NotProvided() {
  return (
    <span className="text-[11px] font-medium italic text-slate-400">
      Not provided
    </span>
  );
}

/**
 * Renders a database value, or "Not provided" when it is null, undefined or
 * an empty string. `format` turns a present value into what is shown.
 */
export function show<T>(
  value: T | null | undefined,
  format?: (value: T) => ReactNode,
): ReactNode {
  if (value === null || value === undefined || value === "") {
    return <NotProvided />;
  }
  return format ? format(value) : (value as ReactNode);
}
