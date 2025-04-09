function errorHandler(err, req, res, next) {
  // This middleware has 4 arguments. It will run whenever `next(err)` is called.
  // Log the error first
  console.error("ERROR", req.method, req.path, err);
  // Test of a specific error coming from MongoDB
  if (err.code == 11000) {
    res.status(400).json({ message: "duplicate key" });
  }
  // ... //
  // here we can add others custom error message according to others error codes
  // ... //
  // Check if the response was already sent, as sending a response twice for the same request will cause an error.
  if (!res.headersSent) {
    // If not, send a response with status code 500 and a generic error message
    res
      .status(500)
      .json({ message: "Internal server error. Check the server console" });
  }
}

function notFoundHandler(req, res, next) {
  // This middleware will run whenever the requested route is not found
  res.status(404).json({ message: "This route does not exist" });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};
