"use client";

import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

type Props = {
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  autoComplete?: string;
};

export function PasswordInput({ name = "password", value, defaultValue, onChange, required, placeholder, autoComplete = "current-password" }: Props) {
  const [visible, setVisible] = useState(false);
  const controlled = value !== undefined;
  return (
    <div className="password-field">
      <input
        name={name}
        type={visible ? "text" : "password"}
        value={controlled ? value : undefined}
        defaultValue={controlled ? undefined : defaultValue}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      <button type="button" className="password-toggle" onClick={() => setVisible((v) => !v)} aria-label={visible ? "비밀번호 숨기기" : "비밀번호 보기"}>
        {visible ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}
