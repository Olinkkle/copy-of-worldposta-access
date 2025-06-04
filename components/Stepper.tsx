
import React from 'react';
import { CheckCircleIcon } from '../constants';

interface StepperProps {
  steps: string[];
  currentStepIndex: number;
}

export const Stepper: React.FC<StepperProps> = ({ steps, currentStepIndex }) => {
  return (
    <nav aria-label="Progress">
      <ol
        role="list"
        className="stepper flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-4 md:space-x-6 items-center sm:items-start py-2"
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isActive = index === currentStepIndex;
          const isFuture = index > currentStepIndex;

          let stepItemClasses = "step-item relative w-full max-w-[120px] sm:max-w-none sm:flex-1 min-w-0"; // Adjusted max-width for vertical stack
          if (isActive) stepItemClasses += " active";
          else if (isCompleted) stepItemClasses += " completed";
          else if (isFuture) stepItemClasses += " upcoming";

          // Define circle size, used for line positioning
          const circleHeightClass = "h-8"; // Corresponds to 2rem
          const circleVerticalCenterOffset = "top-4"; // Half of h-8

          return (
            <li key={step} className={stepItemClasses}>
              {/* Vertical Line (visible on small screens, hidden on sm and up) */}
              {index > 0 && (
                <div
                  className={`block sm:hidden absolute left-1/2 -translate-x-1/2 bottom-full w-0.5 h-6 /* h-6 is space-y-6 */ ${
                    isCompleted ? 'bg-worldposta-primary' : 'bg-brand-border dark:bg-brand-border-dark'
                  }`}
                  aria-hidden="true"
                />
              )}
              {/* Horizontal Line (hidden on small, visible on sm and up) */}
              {index > 0 && (
                <div
                  className={`hidden sm:block absolute right-[calc(50%+0.5rem)] md:right-[calc(50%+0.75rem)] ${circleVerticalCenterOffset} w-full h-0.5 ${
                    isCompleted || isActive ? 'bg-worldposta-primary' : 'bg-brand-border dark:bg-brand-border-dark'
                  }`}
                  aria-hidden="true"
                />
              )}

              <div className="flex flex-col items-center space-y-1 text-center relative z-10 group">
                {/* Step Indicator (Icon/Number) */}
                <span
                  className={`flex items-center justify-center w-8 ${circleHeightClass} rounded-full text-sm transition-all duration-200
                    ${
                      isCompleted
                        ? 'border-2 border-worldposta-primary text-worldposta-primary dark:text-worldposta-primary-light bg-brand-bg-light dark:bg-brand-bg-dark-alt group-hover:bg-worldposta-primary/10'
                        : isActive
                        ? 'bg-worldposta-primary text-brand-text-light font-bold ring-4 ring-worldposta-primary-light dark:ring-worldposta-primary/30'
                        : 'bg-brand-bg-light dark:bg-brand-bg-dark-alt border-2 border-brand-border dark:border-brand-border-dark text-brand-text-secondary dark:text-brand-text-light-secondary group-hover:border-worldposta-primary/50'
                    }`}
                >
                  {isCompleted ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : isActive ? (
                    <span className="font-bold">{index + 1}</span>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </span>

                {/* Step Name */}
                <span
                  className={`text-xs sm:text-sm leading-tight group-hover:opacity-100 transition-opacity
                    ${
                      isActive
                        ? 'text-worldposta-primary dark:text-worldposta-primary-light font-bold'
                        : isCompleted
                        ? 'text-green-700 dark:text-green-400 font-medium'
                        : 'text-gray-600 dark:text-gray-400 font-medium opacity-90'
                    }`}
                  {...(isActive && { "aria-current": "step" })}
                >
                  {step}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
