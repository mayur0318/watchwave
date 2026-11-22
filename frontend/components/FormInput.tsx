type FormInputProps = {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
};

export default function FormInput({
  id,
  label,
  type = "text",
  value,
  onChange,
  error,
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm text-gray-300">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white focus:border-cyan-500 focus:outline-none"
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
