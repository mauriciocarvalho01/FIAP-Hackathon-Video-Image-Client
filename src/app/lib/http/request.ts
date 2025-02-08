import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

type SafeAsyncResult<T> = [T | null, Error | null];

async function safeAsync<T>(
  asyncFn: () => Promise<T>
): Promise<SafeAsyncResult<T>> {
  try {
    const data = await asyncFn();
    return [data, null];
  } catch (error) {
    let normalizedError: Error;

    // Verifica se é um AxiosError
    if (axios.isAxiosError(error)) {
      normalizedError = error?.response?.data
    } else {
      // Caso contrário, normaliza como um erro genérico
      normalizedError =
        error instanceof Error ? error : new Error(String(error));
    }

    return [null, normalizedError];
  }
}

export async function request<T>({
  method,
  url,
  data,
  config,
}: {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  url: string;
  data?: unknown;
  config?: AxiosRequestConfig;
}): Promise<SafeAsyncResult<AxiosResponse<T>>> {
  return safeAsync(() =>
    axios({
      method,
      url,
      data,
      ...config,
    })
  );
}
