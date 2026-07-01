"use client";

import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import {
  BaseField,
  useFormStateContext,
  pdfRectToScreen,
  type FormField,
} from "react-acroform";

type AcroTextFieldProps = {
  field: FormField;
  scale: number;
  pageHeight: number;
  className?: string;
};

const MIN_FIELD_FONT_PX = 9;
const MAX_FIELD_FONT_PX = 16;
const FIELD_HEIGHT_RATIO = 0.62;
const DEFAULT_FIELD_FONT_PX = 12;

function getInputStyle(field: FormField, fieldHeight: number, scale = 1): CSSProperties {
  let fontSizePx: number;
  if (field.fontSize) {
    fontSizePx = field.fontSize * scale * 1.12;
  } else if (fieldHeight && scale > 0) {
    const unscaledHeight = fieldHeight / scale;
    const baseFontSize = Math.max(
      MIN_FIELD_FONT_PX,
      Math.min(unscaledHeight * FIELD_HEIGHT_RATIO, MAX_FIELD_FONT_PX)
    );
    fontSizePx = baseFontSize * scale;
  } else {
    fontSizePx = DEFAULT_FIELD_FONT_PX * scale;
  }

  const paddingH = Math.max(1, 2 * scale);
  return {
    width: "100%",
    boxSizing: "border-box",
    border: "1px solid transparent",
    backgroundColor: field.readOnly ? "transparent" : "rgba(255, 255, 255, 0.8)",
    fontSize: `${fontSizePx}px`,
    color: field.fontColor ?? "inherit",
    paddingTop: "0px",
    paddingBottom: "0px",
    paddingLeft: `${paddingH}px`,
    paddingRight: `${paddingH}px`,
    fontFamily: "inherit",
    outline: "none",
  };
}

function getFocusStyle(): CSSProperties {
  return {
    border: "1px solid #0066cc",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
  };
}

function getCombInputStyle(fieldWidthPx: number, maxLength: number, fontSizePx: number): CSSProperties {
  const cellWidth = fieldWidthPx / maxLength;
  const charWidth = fontSizePx * 0.6;
  const letterSpacing = cellWidth - charWidth;
  const paddingLeft = (cellWidth - charWidth) / 2;

  return {
    fontFamily: "'Courier New', Courier, monospace",
    letterSpacing: `${letterSpacing}px`,
    paddingTop: "0px",
    paddingBottom: "0px",
    paddingLeft: `${paddingLeft}px`,
    paddingRight: "0px",
    textAlign: "left",
    overflow: "hidden",
  };
}

function buildTextInputStyle(
  field: FormField,
  fieldWidth: number,
  fieldHeight: number,
  scale: number,
  focused: boolean
): CSSProperties {
  const baseInputStyle = getInputStyle(field, fieldHeight, scale);
  const fontSizePx = parseFloat(String(baseInputStyle.fontSize)) || DEFAULT_FIELD_FONT_PX * scale;

  if (field.comb && field.maxLength) {
    return {
      ...baseInputStyle,
      ...(focused ? getFocusStyle() : {}),
      ...getCombInputStyle(fieldWidth, field.maxLength, fontSizePx),
      resize: "none",
    };
  }

  return {
    ...baseInputStyle,
    ...(focused ? getFocusStyle() : {}),
    resize: "none",
  };
}

/**
 * Drop-in TextField replacement that avoids React's padding vs paddingRight conflict
 * on comb (character-box) PDF fields from react-acroform.
 */
export default function AcroTextField({ field, scale, pageHeight, className }: AcroTextFieldProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formState = useFormStateContext();

  const handleFocus = useCallback(() => setFocused(true), []);
  const handleBlur = useCallback(() => setFocused(false), []);

  const { width: fieldWidth, height: fieldHeight } = pdfRectToScreen(field.rect, pageHeight, scale);

  useEffect(() => {
    const value = formState.getValue(field.name);
    const stringValue = String(value ?? "");
    if (inputRef.current && inputRef.current.value !== stringValue) {
      inputRef.current.value = stringValue;
    }
    if (textareaRef.current && textareaRef.current.value !== stringValue) {
      textareaRef.current.value = stringValue;
    }
  }, [formState.version, formState, field.name]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      formState.setValue(field.name, event.target.value);
    },
    [formState, field.name]
  );

  const inputStyle = buildTextInputStyle(field, fieldWidth, fieldHeight, scale, focused);
  const initialValue = String(formState.getValue(field.name) ?? "");

  const commonProps = {
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleChange,
    readOnly: field.readOnly,
    required: field.required,
    maxLength: field.maxLength && field.maxLength > 0 ? field.maxLength : undefined,
    style: inputStyle,
    "aria-label": field.name,
    className: `react-acroform-input${field.comb ? " react-acroform-input--comb" : ""}`,
    defaultValue: initialValue,
  };

  return (
    <BaseField field={field} scale={scale} pageHeight={pageHeight} className={className}>
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {field.multiline ? (
          <textarea ref={textareaRef} {...commonProps} />
        ) : (
          <input ref={inputRef} type="text" {...commonProps} />
        )}
      </div>
    </BaseField>
  );
}
