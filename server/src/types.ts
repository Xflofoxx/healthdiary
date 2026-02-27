export interface ErrorMessage {
  error: string;
  status: number;
}

export interface SuccessResponse<T> {
  data: T;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
}
