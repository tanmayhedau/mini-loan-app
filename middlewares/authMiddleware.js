const jwt = require('jsonwebtoken');

module.exports.authenticate = (req, res, next) => {
  try {
    //setting token in headers
    let token = req.headers["authorization"];
    if (!token) {
      return res.status(400).json({ success: false, message: "Please provide token" });
    } else {
      // using Bearer ${token}
      token = token.split(' ')[1];

      //verifying the token
      jwt.verify(token, process.env.SECRET_KEY, (err, data) => {
        if (err) {
          return res.status(401).json({ success: false, message: "Session expired, please login again" });
        } else {
          req.loginUserId = data._id;
          next();
        }
      });
    }


  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};



