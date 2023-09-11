const UserModel = require("../models/userModel");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports.registerUser = async (req, res) => {
  try {

    const { name, email, password } = req.body;
    //validations
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields." });
    }

    const checkExistingUser = await UserModel.findOne({ email });
    if (checkExistingUser) {
      return res.status(400).json({ success: false, message: "User already exist, please login" });
    }

    // hash passwords
    const hashPassword = await bcrypt.hash(password, 10);

    //create user
    const user = await UserModel.create({ ...req.body, password: hashPassword });

    //setting password undefined for security reasons
    user.password = undefined;
    return res.status(201).json({ success: true, message: "user registered successfully", data: user });


  } catch (error) {
    console.log("Error from registerUser", error.message);
    return res.status(500).json({ message: error.message });
  }
};


module.exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validations
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill all fields." });
    }

    // checking if user is present in db
    const checkExistingUser = await UserModel.findOne({ email });
    if (!checkExistingUser) {
      return res.status(404).json({ success: false, message: "User does not exist, please register" });
    }

    // compare hashpassword with password present in db
    const isMatch = await bcrypt.compare(password, checkExistingUser.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: "Invalid credentials, please try again later.." });
    }

    // create token for authentication and authorization
    const token = jwt.sign({ _id: checkExistingUser._id.toString() }, process.env.SECRET_KEY, { expiresIn: "72h" });

    checkExistingUser.password = undefined;

    return res.status(200).json({ success: true, message: "User loggedIn successfully", token, data: checkExistingUser });

  } catch (error) {
    console.log("Error from loginUser", error.message);
    return res.status(500).json({ message: error.message });
  }
};