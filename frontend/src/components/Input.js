"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef(({ 
  className, 
  type = "text", 
  error,
  label,
  helperText,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex w-full rounded-lg border border-border bg-background px-3 py-2.5",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export const Textarea = forwardRef(({ 
  className, 
  error,
  label,
  helperText,
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={cn(
          "flex w-full rounded-lg border border-border bg-background px-3 py-2.5",
          "text-sm text-foreground placeholder:text-muted-foreground",
          "transition-colors duration-200 resize-none",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = "Textarea";

export const Select = forwardRef(({ 
  className, 
  error,
  label,
  helperText,
  options = [],
  placeholder = "Select an option",
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-1.5">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "flex w-full rounded-lg border border-border bg-background px-3 py-2.5",
          "text-sm text-foreground",
          "transition-colors duration-200",
          "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "appearance-none bg-no-repeat bg-right-3",
          error && "border-red-500 focus:ring-red-500/20",
          className
        )}
        style={{
          color: "var(--foreground)",
          backgroundColor: "var(--background)",
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
          backgroundPosition: "right 12px center",
          paddingRight: "40px",
        }}
        {...props}
      >
        <option value="" style={{ color: "var(--muted-foreground)", backgroundColor: "var(--background)" }}>
          {placeholder}
        </option>
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            style={{ color: "var(--foreground)", backgroundColor: "var(--background)" }}
          >
            {option.label}
          </option>
        ))}
      </select>
      {helperText && !error && (
        <p className="mt-1.5 text-xs text-muted-foreground">{helperText}</p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export const Checkbox = forwardRef(({ 
  className, 
  label,
  ...props 
}, ref) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        ref={ref}
        className={cn(
          "h-4 w-4 rounded border-border text-primary",
          "focus:ring-2 focus:ring-ring focus:ring-offset-2",
          "cursor-pointer",
          className
        )}
        {...props}
      />
      {label && (
        <span className="text-sm text-foreground">{label}</span>
      )}
    </label>
  );
});

Checkbox.displayName = "Checkbox";