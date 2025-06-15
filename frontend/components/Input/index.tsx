interface InputProps {
  type: React.HTMLInputTypeAttribute;
  name: string;
  value: string | number | readonly string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
  min?: number;
}

const Input = ({
  type,
  name,
  value,
  onChange,
  required = false,
  className = "",
  placeholder = "",
  min = 0,
}: InputProps) => {
  return (
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
      className={`"w-full bg-white px-6 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300" ${className}`}
      placeholder={placeholder}
      min={min}
    />
  );
};

export default Input;
