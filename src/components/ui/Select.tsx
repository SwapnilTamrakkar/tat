import React, { useState, useRef, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectProps {
    value: string | number;
    onChange: (e: { target: { value: string } }) => void;
    children: ReactNode;
    className?: string;
    style?: React.CSSProperties;
    disabled?: boolean;
}

export function Select({ value, onChange, children, className = '', style, disabled = false }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Extract options from flattened children
    const options: { value: string; label: string; disabled: boolean }[] = [];
    React.Children.toArray(children).forEach((child) => {
        if (React.isValidElement(child) && child.type === 'option') {
            const props = (child as React.ReactElement).props as any;
            options.push({
                value: String(props.value !== undefined ? props.value : props.children || ''),
                label: props.children?.toString() || '',
                disabled: !!props.disabled
            });
        }
    });

    const stringValue = String(value);
    const selectedOption = options.find((opt) => opt.value === stringValue);
    const displayLabel = selectedOption ? selectedOption.label : 'Select...';

    const handleSelect = (val: string) => {
        onChange({ target: { value: val } });
        setIsOpen(false);
    };

    return (
        <div ref={containerRef} className={`custom-select-container ${className.replace('form-select', '')}`} style={{ position: 'relative', width: '100%', minWidth: 100, ...style }}>
            <button
                type="button"
                className={`form-select ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    textAlign: 'left',
                    background: disabled ? 'var(--color-bg-secondary)' : 'var(--color-surface)',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    opacity: disabled ? 0.7 : 1,
                    // If the original input had a border error state etc., it inherits via form-select class correctly.
                    border: style?.borderColor ? `1px solid ${style.borderColor}` : undefined
                }}
            >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {displayLabel}
                </span>
                <ChevronDown size={14} style={{ 
                    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.2s ease', 
                    color: 'var(--color-text-tertiary)',
                    flexShrink: 0 
                }} />
            </button>

            {isOpen && !disabled && (
                <div className="custom-select-dropdown" style={{
                    position: 'absolute',
                    top: 'calc(100% + 6px)',
                    left: 0,
                    right: 0,
                    zIndex: 9999, // Super high z-index
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    maxHeight: 250,
                    overflowY: 'auto',
                    padding: 'var(--space-2)'
                }}>
                    {options.length === 0 && (
                        <div style={{ padding: 'var(--space-2) var(--space-3)', color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
                            No options available
                        </div>
                    )}
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => !opt.disabled && handleSelect(opt.value)}
                            style={{
                                padding: 'var(--space-2) var(--space-3)',
                                borderRadius: 'var(--radius-sm)',
                                cursor: opt.disabled ? 'not-allowed' : 'pointer',
                                opacity: opt.disabled ? 0.5 : 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: opt.value === stringValue ? 'var(--color-primary-50)' : 'transparent',
                                color: opt.value === stringValue ? 'var(--color-primary)' : 'var(--color-text-primary)',
                                fontWeight: opt.value === stringValue ? 600 : 400,
                                fontSize: 'var(--font-size-sm)',
                                transition: 'background 0.1s ease',
                            }}
                            onMouseEnter={(e) => {
                                if (!opt.disabled && opt.value !== stringValue) {
                                    e.currentTarget.style.background = 'var(--color-bg-secondary)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!opt.disabled && opt.value !== stringValue) {
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {opt.label}
                            </span>
                            {opt.value === stringValue && <Check size={14} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
