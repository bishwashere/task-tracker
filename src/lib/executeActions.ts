import { isRedirectError } from "next/dist/client/components/redirect-error";

type Options<T> = {
  actionFn: () => Promise<T>;
  successMessage?: string;
  errorMessage?: string;
};

const executeAction = async <T>({
  actionFn,
  successMessage = "The action was successful",
  errorMessage = "Something went wrong",
}: Options<T>): Promise<{ success: boolean; message: string }> => {
  try {
    await actionFn();

    return { success: true, message: successMessage };
  
  } catch (error) {
    
    if (isRedirectError(error)) {
      throw error;
    }

    return {
      success: false,
      message: error instanceof Error ? error.message : errorMessage,
    };
  }
};

export { executeAction };
