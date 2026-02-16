export interface StatusOption {
    value: string;
    label: string;
}

interface StatusFilterProps {
    value: string;
    onChange: (value: string) => void;
    options: StatusOption[];
    placeholder?: string;
    label?: string;
    className?: string;
}

export function StatusFilter({
    value,
    onChange,
    options,
    placeholder = 'Todos los estados',
    label,
    className = '',
}: StatusFilterProps) {
    return (
        <div className={`flex flex-col gap-2 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-700">{label}</label>
            )}
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
