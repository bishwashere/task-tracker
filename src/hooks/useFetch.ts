import { useState, useCallback, useEffect } from "react";

interface FetchState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  status: "idle" | "loading" | "success" | "error";
}

interface FetchOptions<T> {
  disabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
}

type FetchResult<T> =
  | { data: T; success: true }
  | { error: string; success: false };

export function useFetch<T>(
  fetcher: () => Promise<T>,
  options?: FetchOptions<T>,
) {
  const { disabled = false, onSuccess, onError } = options || {};

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    error: null,
    loading: false,
    status: "idle",
  });

  const execute = useCallback(async (): Promise<FetchResult<T>> => {
    setState((prev) => ({
      ...prev,
      loading: true,
      status: "loading",
      error: null,
    }));

    try {
      const data = await fetcher();

      setState({
        data,
        loading: false,
        error: null,
        status: "success",
      });

      onSuccess?.(data);
      return { data, success: true };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "An unexpected error occurred";

      setState({
        data: null,
        loading: false,
        error: errorMessage,
        status: "error",
      });

      onError?.(errorMessage);
      return { error: errorMessage, success: false };
    }
  }, [fetcher, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      error: null,
      loading: false,
      status: "idle",
    });
  }, []);

  useEffect(() => {
    if (!disabled) {
      execute();
    }
  }, [disabled, execute]);

  return {
    ...state,
    execute,
    reset,
  };
}
