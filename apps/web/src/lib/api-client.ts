import axios, { type AxiosRequestConfig } from "axios";

const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export function createApiClient(
  getJwt: () => string | undefined,
  onUnauthorized?: () => void,
) {
  const client = axios.create({ baseURL: API_BASE });

  client.interceptors.request.use((config) => {
    const jwt = getJwt();
    if (jwt) config.headers.Authorization = `Bearer ${jwt}`;
    return config;
  });

  client.interceptors.response.use(
    (res) => res,
    (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        onUnauthorized?.();
      }
      return Promise.reject(error);
    },
  );

  return async function apiFetch<T = unknown>(
    path: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    const res = await client.request<T>({ url: path, ...config });
    return res.data;
  };
}
