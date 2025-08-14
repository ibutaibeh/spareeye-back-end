const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. No token Provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.playLoad;
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid Token"});
  }
};

module.exports = verifyToken;
