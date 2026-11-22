const errorHandler = (err, req, res, next) => {
  // If the response has already started, let Express finish it
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.statusCode || err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";

  // Log unexpected (server-side) errors for ourselves
  if (statusCode >= 500) {
    console.error(err);
  }

  // Hide internal details of server errors in production
  const message =
    statusCode >= 500 && isProduction
      ? "Internal Server Error"
      : err.message || "Something went wrong";

  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors: err.errors || [],
    ...(isProduction ? {} : { stack: err.stack }),
  });
};

export { errorHandler };
