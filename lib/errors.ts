export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(message: string, statusCode: number = 400, code: string = "INTERNAL_ERROR") {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication required") {
        super(message, 401, "AUTH_ERROR");
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Permission denied") {
        super(message, 403, "FORBIDDEN");
    }
}

export class ValidationError extends AppError {
    public readonly errors: any;

    constructor(errors: any) {
        super("Validation failed", 400, "VALIDATION_ERROR");
        this.errors = errors;
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Too many requests. Please try again later.") {
        super(message, 429, "RATE_LIMIT_EXCEEDED");
    }
}
