import * as React from "react";
import { Check } from "lucide-react";

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, onCheckedChange, checked, ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            onCheckedChange?.(e.target.checked);
            props.onChange?.(e);
        };

        return (
            <div className="relative inline-flex items-center">
                <input
                    type="checkbox"
                    ref={ref}
                    className="peer sr-only"
                    checked={checked as boolean}
                    onChange={handleChange}
                    {...props}
                />
                <div className={`h-4 w-4 shrink-0 rounded-sm border border-gray-300 ring-offset-white peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-50 peer-checked:bg-blue-600 peer-checked:border-blue-600 peer-checked:text-white flex items-center justify-center transition-colors ${className || ''}`}>
                    {checked && <Check className="h-3 w-3 text-white" />}
                </div>
            </div>
        );
    }
);

Checkbox.displayName = "Checkbox";

export { Checkbox };
