const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? (process.env.REACT_APP_API_URL ?? "https://api.example.com")
    : "http://localhost:8000";

interface ApiError {
  error: string;
  detail?: string;
}

class ApiClient {
  readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: "Request failed",
        detail: response.statusText,
      }));
      throw new Error(error.detail ?? error.error);
    }

    return response.json();
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(path: string, body: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiError };
