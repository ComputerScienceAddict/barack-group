"use client";

import { useCallback, useState, type CSSProperties } from "react";
import { BaseField, pdfRectToScreen, useFormStateContext, type FormField } from "react-acroform";

type AcroDropdownFieldProps = {
  field: FormField;
  scale: number;
  pageHeight: number;
  className?: string;
};

function getSelectStyle(field: FormField, fieldHeight: number, scale = 1, focused: boolean): CSSProperties {
  const fontSizePx = Math.max(9, Math.min((field.fontSize || 12) * scale, 16));
  return {
    width: "100%",
    height: "100%",
    boxSizing: "border-box",
    border: focused ? "1px solid #0066cc" : "1px solid #64748b",
    backgroundColor: focused ? "rgba(255, 255, 255, 0.98)" : "rgba(255, 255, 255, 0.95)",
    fontSize: `${fontSizePx}px`,
    color: field.fontColor ?? "inherit",
    padding: "0 2px",
    fontFamily: "inherit",
    lineHeight: fieldHeight > 0 ? `${fieldHeight}px` : undefined,
    outline: "none",
    cursor: field.readOnly ? "default" : "pointer",
  };
}

export default function AcroDropdownField({
  field,
  scale,
  pageHeight,
  className,
}: AcroDropdownFieldProps) {
  const [focused, setFocused] = useState(false);
  const formState = useFormStateContext();
  const [localValue, setLocalValue] = useState(() => String(formState.getValue(field.name) ?? ""));

  const commitValue = useCallback(
    (value: string) => {
      setLocalValue((current) => (current === value ? current : value));
      formState.setValue(field.name, value);
    },
    [field.name, formState]
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLSelectElement>) => {
      setFocused(false);
      commitValue(event.currentTarget.value);
    },
    [commitValue]
  );

  const { height: fieldHeight } = pdfRectToScreen(field.rect, pageHeight, scale);
  const options = field.options ?? [];
  const showPlaceholder = !localValue;

  return (
    <BaseField field={field} scale={scale} pageHeight={pageHeight} className={className}>
      <select
        value={localValue}
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onChange={(event) => commitValue(event.target.value)}
        onInput={(event) => commitValue(event.currentTarget.value)}
        disabled={field.readOnly}
        required={field.required}
        style={getSelectStyle(field, fieldHeight, scale, focused)}
        aria-label={field.name}
        className="react-acroform-select"
      >
        {showPlaceholder && <option value="">Select...</option>}
        {options.map((option, index) => (
          <option key={`${option}-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    </BaseField>
  );
}
