export const errorHandler = (err, req, res, next) => {
  console.error("Server Error Hook:", err);

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  let message = err.message || "Internal Server Error";
  let errors = err.errors || undefined;

  // Custom DB Error Handling
  if (err.code === "ER_DUP_ENTRY") {
    res.status(400);
    message = "A record with this unique value (slug/SKU/email) already exists.";
  } else if (err.code === "ER_NO_REFERENCED_ROW_2" || err.code === "ER_NO_REFERENCED_ROW") {
    res.status(400);
    message = "Foreign key reference integrity violation. Check related entity.";
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    res.status(401);
    message = "Invalid auth token, authorization denied.";
  } else if (err.name === "TokenExpiredError") {
    res.status(401);
    message = "Auth token expired. Please login again.";
  }

  res.status(res.statusCode || statusCode).json({
    message,
    errors,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};
