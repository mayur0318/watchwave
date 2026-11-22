export interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}
export interface ApiErrorBody {
  statusCode: number;
  errors: unknown[];
  message: string;
  success: false;
  stack?: string;
}
