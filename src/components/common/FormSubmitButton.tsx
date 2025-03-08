import { useFormStatus } from "react-dom";

const FormSubmitButton = ({ className, children }: { className?: string; children: React.ReactNode }) => {
    const { pending } = useFormStatus();
    return (
        <button type="submit" disabled={pending} className={`${className} disabled:opacity-75`}>
            {children}
        </button>
    );
}

export default FormSubmitButton;