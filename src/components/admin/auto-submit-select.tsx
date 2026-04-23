"use client";

import { useRef } from "react";

interface Option {
  value: string;
  label: string;
}

interface AutoSubmitSelectProps {
  name: string;
  defaultValue: string;
  options: Option[];
  placeholder?: string;
  className?: string;
}

/**
 * A <select> that auto-submits its parent <form> when the value changes.
 * Drop it inside any server-component <form method="GET"> and it will
 * immediately fire the navigation when the user picks a different option.
 */
export function AutoSubmitSelect({
  name,
  defaultValue,
  options,
  placeholder,
  className = "",
}: AutoSubmitSelectProps) {
  const ref = useRef<HTMLSelectElement>(null);

  return (
    <select
      ref={ref}
      name={name}
      defaultValue={defaultValue}
      onChange={() => ref.current?.form?.submit()}
      className={`h-9 px-3 text-sm rounded-lg border border-charcoal/15 bg-white text-charcoal focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
