class ApiError extends Error {
  constructor(
    statusCode = "500",
    message = "Something went wrong",
    errors = []
  ) {
    super(message, errors);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
