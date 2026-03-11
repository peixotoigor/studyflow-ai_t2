import React, { useId } from 'react';

interface AuthFieldProps {
  id?: string;
  name?: string;
  label: string;
  icon?: string;
  type?: string;
  value: string;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  hint?: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  action?: React.ReactNode;
}

export const AuthField: React.FC<AuthFieldProps> = ({
  id,
  name,
  label,
  icon,
  type = 'text',
  value,
  placeholder,
  disabled,
  required,
  autoComplete,
  inputMode,
  hint,
  onChange,
  action,
}) => {
  const autoId = useId();
  const inputId = id || autoId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const classNames = [
    'auth-input',
    icon ? 'has-icon' : '',
    action ? 'has-action' : '',
  ].filter(Boolean).join(' ');

  return (
    <label className="auth-field">
      <span className="auth-field-label" aria-hidden="true">{label}</span>
      <span className="auth-input-wrap">
        {icon ? <span className="material-symbols-outlined auth-input-icon">{icon}</span> : null}
        <input
          id={inputId}
          name={name}
          className={classNames}
          type={type}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          aria-label={label}
          aria-describedby={hintId}
          onChange={onChange}
        />
        {action}
      </span>
      {hint ? <span id={hintId} className="auth-field-hint">{hint}</span> : null}
    </label>
  );
};