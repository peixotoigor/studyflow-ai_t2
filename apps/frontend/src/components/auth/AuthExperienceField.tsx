import React, { useId } from 'react';

interface AuthExperienceFieldProps {
  label: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  icon?: string;
  name?: string;
  autoComplete?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  disabled?: boolean;
  required?: boolean;
  helper?: string;
  action?: React.ReactNode;
}

export const AuthExperienceField: React.FC<AuthExperienceFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  icon,
  name,
  autoComplete,
  inputMode,
  disabled,
  required,
  helper,
  action,
}) => {
  const id = useId();
  const helperId = helper ? `${id}-helper` : undefined;
  return (
    <label className="credential-field" htmlFor={id}>
      <span className="credential-field-label">{label}</span>
      <span className="credential-field-wrap">
        {icon ? <span className="credential-field-icon material-symbols-outlined">{icon}</span> : null}
        <input
          id={id}
          name={name}
          className={`credential-field-input${icon ? ' has-icon' : ''}${action ? ' has-action' : ''}`}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          autoComplete={autoComplete}
          inputMode={inputMode}
          disabled={disabled}
          required={required}
          aria-describedby={helperId}
        />
        {action}
      </span>
      {helper ? <span id={helperId} className="credential-field-helper">{helper}</span> : null}
    </label>
  );
};