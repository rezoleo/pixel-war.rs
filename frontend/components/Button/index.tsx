import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  onClick: () => void;
};

const Button: React.FC<ButtonProps> = ({ children, className, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 text-white font-bold bg-gradient-to-r hover:cursor-pointer hover:from-rose-700 hover:to-red-900
        from-rose-900 to-red-950 rounded-lg ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
