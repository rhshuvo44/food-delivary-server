export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    statusCode: number;
    meta?: Record<string, unknown>;
}

export function successResponse<T>(
    data: T,
    message: string = 'Success',
    statusCode: number = 200,
): ApiResponse<T> {
    return {
        success: true,
        message,
        data,
        statusCode,
    };
}

export function paginatedResponse<T>(
    data: T,
    meta: Record<string, unknown>,
    message: string = 'Success',
    statusCode: number = 200,
): ApiResponse<T> {
    return {
        success: true,
        message,
        data,
        meta,
        statusCode,
    };
}

export function errorResponse(
    message: string = 'Error',
    error?: string,
    statusCode: number = 500,
): ApiResponse {
    return {
        success: false,
        message,
        error,
        statusCode,
    };
}
