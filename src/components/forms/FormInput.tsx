
import type { InputHTMLAttributes } from "react";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string,
    error?: string,
}

function FormInput({
    label,
    error,
    id,
    ...props
}: FormInputProps) {

    // Use the supplied id, or fallback to the input name
    const inputId = id ?? props.name;

    return (
        <div className="mb-4">
            { /* Input Label */ }
            <label htmlFor={props.name} className="mb-1 text-sm font-medium">
                { label }
                { props.required && <span className="text-red-500">*</span> }
            </label>

            { /* Input Field */ }
            <input 
                id={inputId}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${inputId}-error` : undefined}
                className={
                    `w-full rounded-md border px-3 py-2 outline-none
                    ${ error ? 'border-red-500' : 'border-gray-300' }`
                }
            />

            { /* Display validation error */ }
            {error && (
                <span className="mb-1 text-sm block text-red-500" id={`${inputId}-error`} role="alert">
                    {error}
                </span>
            )}
        </div>
    )
}

export default FormInput