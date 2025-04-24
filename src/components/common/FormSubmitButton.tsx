import React from "react";
import { useFormStatus } from "react-dom";

const FormSubmitButton = ({
  className,
  children,
  type,
  ...props
}: React.HTMLProps<HTMLButtonElement>) => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={`${className} disabled:opacity-75`}
      {...props}
    >
      {children}
    </button>
  );
};

export default FormSubmitButton;
