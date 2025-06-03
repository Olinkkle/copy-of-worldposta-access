
import React from 'react';

interface VDCResourceControlProps {
  id: string;
  label: string;
  priceText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unitLabel?: string;
  unitLabelForValue?: string;
  onChange: (value: number) => void;
  disabled?: boolean; // Added disabled prop
}

export const VDCResourceControl: React.FC<VDCResourceControlProps> = ({
  id,
  label,
  priceText,
  min,
  max,
  step,
  value,
  unitLabel,
  unitLabelForValue,
  onChange,
  disabled = false, // Default to false
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    let numericValue = parseInt(e.target.value, 10);
    if (isNaN(numericValue)) numericValue = min;
    if (numericValue < min) numericValue = min;
    if (numericValue > max) numericValue = max;
    onChange(numericValue);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    onChange(parseInt(e.target.value, 10));
  };

  const increment = () => {
    if (disabled) return;
    if (value + step <= max) {
      onChange(value + step);
    }
  };

  const decrement = () => {
    if (disabled) return;
    if (value - step >= min) {
      onChange(value - step);
    }
  };

  const inputButtonClasses = `px-3 py-1.5 border border-brand-border dark:border-brand-border-dark bg-brand-bg-light-alt dark:bg-brand-bg-dark hover:bg-opacity-80 dark:hover:bg-opacity-80 rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-worldposta-primary text-sm font-medium text-brand-text dark:text-brand-text-light ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  const numericInputClasses = `w-20 text-center border border-brand-border dark:border-brand-border-dark rounded-md py-1.5 bg-brand-bg-light-alt dark:bg-brand-bg-dark focus:outline-none focus:ring-1 focus:ring-worldposta-primary text-sm text-brand-text dark:text-brand-text-light ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
  const sliderClasses = `w-full h-2 bg-brand-bg-light-alt dark:bg-brand-bg-dark rounded-lg appearance-none accent-worldposta-primary ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`;


  return (
    <div className={`py-3 border-b border-brand-border dark:border-brand-border-dark last:border-b-0 ${disabled ? 'opacity-70' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-brand-text dark:text-brand-text-light">{label}</span>
        <div className="text-right">
            <span className="block text-sm font-semibold text-brand-text dark:text-brand-text-light">{value} {unitLabelForValue || ''}</span>
            <span className="block text-xs text-brand-text-secondary dark:text-brand-text-light-secondary">{priceText}</span>
        </div>
      </div>
      <div className="flex items-center space-x-1.5 mt-1">
        <button onClick={decrement} className={inputButtonClasses} aria-label={`Decrement ${label}`} disabled={disabled || value <= min}>-</button>
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className={numericInputClasses}
          aria-label={`${label} value`}
          disabled={disabled}
        />
        <button onClick={increment} className={inputButtonClasses} aria-label={`Increment ${label}`} disabled={disabled || value >= max}>+</button>
      </div>
      <div className="mt-2.5">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleSliderChange}
          className={sliderClasses}
          aria-label={`${label} slider`}
          disabled={disabled}
        />
        { (min > 0 || max > 0 ) && (min !== max) &&
            <div className="flex justify-between text-xs text-brand-text-secondary dark:text-brand-text-light-secondary mt-0.5 px-0.5">
            <span>{min} {unitLabel}</span>
            <span>{max} {unitLabel}</span>
            </div>
        }
      </div>
    </div>
  );
};
