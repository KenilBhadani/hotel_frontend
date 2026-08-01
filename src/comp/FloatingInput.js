export default function FloatingInput({
  id,
  name,
  label,
  type = "text",
  value,
  onChange,
  required = false,
  error = false,
  errorMessage = ''
}) {
  return (
    <div className="relative w-full">
      {/* INPUT */}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder=" "
        aria-invalid={error}
        className={`
          peer w-full h-[58px] px-4 pt-6
          border-b-2 ${error ? 'border-red-500' : 'border-slate-300'}
          bg-slate-50 rounded-t-lg
          focus:outline-none focus:border-black
        `}
      />

      {/* FLOATING LABEL */}
      <label
        htmlFor={id}
        className="
          absolute left-4 top-4 text-slate-500 text-sm
          transition-all duration-200
          pointer-events-none
          peer-placeholder-shown:top-5
          peer-placeholder-shown:text-base
          peer-focus:top-2
          peer-focus:text-xs
        "
      >
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>

      {error && (
        <p className="text-red-500 text-sm mt-1">{errorMessage || 'This field is required'}</p>
      )}
    </div>
  );
}
