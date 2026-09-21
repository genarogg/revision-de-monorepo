"use client"
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'
import Icon from '../../nano/Icon'
import './input.scss';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'type'> {
    className?: string;
    name: string;
    type: 'password' | 'text' | 'email' | 'date' | 'number' | 'tel' | 'url';
    icon?: React.ReactNode;
    iconFixed?: boolean;
    id?: string;
    required?: boolean;
    disabled?: boolean;
    max?: number | string;
    min?: number | string;
    hasContentState?: boolean;
    placeholder: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    defaultValue?: string;
    error?: string;
    label?: string;
    'aria-label'?: string;
    'aria-describedby'?: string;
}

export interface InputRef {
    focus: () => void;
    blur: () => void;
    getValue: () => string;
    setValue: (value: string) => void;
}

const resolveInitialHasContent = (
    value: string | undefined,
    defaultValue: string | undefined,
    hasContentState: boolean
): boolean => {
    if (hasContentState) return true;
    if (value !== undefined && value !== '') return true;
    if (defaultValue !== undefined && defaultValue !== '') return true;
    return false;
};

const Input = forwardRef<InputRef, InputProps>(({
    className = "",
    icon,
    iconFixed = false,
    name,
    id = name,
    type,
    required = false,
    disabled = false,
    min,
    max,
    hasContentState = false,
    placeholder,
    onChange,
    value,
    defaultValue,
    error,
    label,
    'aria-label': ariaLabel,
    'aria-describedby': ariaDescribedBy,
    onFocus: externalOnFocus,
    onBlur: externalOnBlur,
    ...restProps
}, ref) => {

    const [isFocused, setIsFocused] = useState(false);
    const [inputType, setInputType] = useState(type);
    const [hasContent, setHasContent] = useState(() =>
        resolveInitialHasContent(value, defaultValue, hasContentState)
    );

    const inputRef = useRef<HTMLInputElement>(null);
    const isControlled = value !== undefined;

    useEffect(() => {
        setInputType(type);
    }, [type]);


    useEffect(() => {
        setHasContent(resolveInitialHasContent(value, defaultValue, hasContentState));
    }, [value, defaultValue, hasContentState]);

    useImperativeHandle(ref, () => ({
        focus: () => inputRef.current?.focus(),
        blur: () => inputRef.current?.blur(),
        getValue: () => inputRef.current?.value || '',
        setValue: (newValue: string) => {
            if (inputRef.current) {
                inputRef.current.value = newValue;
                setHasContent(newValue !== "");
            }
        }
    }));

    const togglePasswordVisibility = () => {
        setInputType(prev => prev === "password" ? "text" : "password");
    };

    const handleInputClick = () => {
        if (type === 'date' && inputRef.current && !disabled) {
            inputRef.current.showPicker();
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setHasContent(newValue !== "");
        onChange?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        if (type === 'date') setInputType('date');
        externalOnFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(false);
        externalOnBlur?.(e);
    };

    const errorId = error ? `${id}-error` : undefined;
    const describedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

    return (
        <div className={`input-wrapper ${className}`}>

            {label && (
                <label htmlFor={id} className="input-label">
                    {label}
                    {required && <span className="required-indicator" aria-label="requerido">*</span>}
                </label>
            )}

            <div
                className={`
                    container-input 
                    ${isFocused ? "focus" : ""} 
                    ${icon ? "" : "no-icon"} 
                    ${error ? "error" : ""} 
                    ${disabled ? "disabled" : ""} 
                    ${!iconFixed && icon ? "icon-placehorder" : ""}
                `}
            >
                {icon && iconFixed && (
                    <div className='label-ico' aria-hidden="true">
                        <Icon icon={icon} />
                    </div>
                )}

                <input
                    ref={inputRef}
                    type={inputType}
                    name={name}
                    id={id}
                    required={required}
                    disabled={disabled}
                    value={isControlled ? value : undefined}
                    defaultValue={!isControlled ? defaultValue : undefined}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    onClick={handleInputClick}
                    aria-label={ariaLabel || (label ? undefined : placeholder)}
                    aria-describedby={describedBy}
                    aria-invalid={error ? 'true' : 'false'}
                    {...(min !== undefined ? { min } : {})}
                    {...(max !== undefined ? { max } : {})}
                    {...restProps}
                />

                {type === "password" && (
                    <button
                        className="view-pass"
                        type="button"
                        onClick={togglePasswordVisibility}
                        disabled={disabled}
                        aria-label={inputType === "password" ? "Mostrar contraseña" : "Ocultar contraseña"}
                        tabIndex={-1}
                    >
                        <Icon icon={inputType === "password" ?
                            <Eye height={18} /> :
                            <EyeOff height={18} />} />
                    </button>
                )}

                <span
                    className={`holder ${hasContent || isFocused ? "has-content" : ""}`}
                    aria-hidden="true"
                >
                    {icon && !iconFixed && (
                        <div className='label-ico' aria-hidden="true">
                            <Icon icon={icon} />
                        </div>
                    )}
                    {placeholder}
                </span>
            </div>

            {error && (
                <div id={errorId} className="error-message" role="alert" aria-live="polite">
                    {error}
                </div>
            )}
        </div>
    );
});

export default Input;