const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "fail",
      message: "Authentication token missing or invalid format",
      code: "TOKEN_MISSING",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "fail",
        message: "Authentication token has expired",
        code: "TOKEN_EXPIRED",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "fail",
        message: "Authentication token is invalid",
        code: "TOKEN_INVALID",
      });
    }
    return res.status(401).json({
      status: "fail",
      message: "Authentication failed due to an unknown error",
      code: "TOKEN_UNKNOWN_ERROR",
    });
  }
};

module.exports = verifyToken;
