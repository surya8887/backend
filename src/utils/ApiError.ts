class ApiError extends Error {
    public statusCode: number;
    public data: any;
    public success: boolean;
    public errors: any[];

    constructor(
        statusCode: number,
        message: string = "Something went wrong",
        errors: any[] = [],
        stack: string = ""
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;

        // Ensure the name and message from Error are preserved
        this.name = this.constructor.name;
        this.message = message;

        // Set the prototype explicitly
        Object.setPrototypeOf(this, ApiError.prototype);

        // Capture or set the stack trace
        if (stack) {
            this.stack = stack;
        } else {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}

export default ApiError;