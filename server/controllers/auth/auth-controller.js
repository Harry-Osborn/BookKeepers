const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { v4: uuidv4 } = require("uuid");
const sendMail = require("../../helpers/nodemailer");
function generateOTP() {
  const uuid = uuidv4();

  const otp = uuid.replace(/\D/g, "").slice(0, 4);

  return otp.padEnd(4, "0");
}

//register
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (checkUser)
      return res.json({
        success: false,
        message: "User Already exists with the same email! Please try again",
      });

    const hashPassword = await bcrypt.hash(password, 12);
    const otp = generateOTP();
    const newUser = new User({
      userName,
      email,
      password: hashPassword,
      otp,
      status: 0,
    });
    await newUser.save();

    await sendMail({
      to: email,
      subject: "Your BookKeepers OTP for Email Verification",
      html: `
        <p>Hello ${userName},</p>
        <p>Thank you for registering with <strong>BookKeepers</strong>.</p>
        <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
        <p style="font-size: 18px;"><strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
        <p>Warm regards,<br/>The BookKeepers Team</p>
      `,
    });

    res.status(200).json({
      success: true,
      message: "User registered succesfully.Now, verify the email",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { otp, email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    if (user.otp != otp) {
      return res.status(400).json({ error: "Check the otp properly bro" });
    } else {
      await User.updateOne(
        { _id: user._id },
        { $set: { status: 1, otp: null } }
      );
      return res.status(200).json({ message: "Login with email and password" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
};

const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    const otp = generateOTP();

    await User.updateOne({ _id: user._id }, { $set: { otp: otp } });
    await sendMail({
      to: email,
      subject: "Your BookKeepers OTP for Email Verification",
      html: `
        <p>Hello ${userName},</p>
        <p>Thank you for registering with <strong>BookKeepers</strong>.</p>
        <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
        <p style="font-size: 18px;"><strong>${otp}</strong></p>
        <p>This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
        <p>Warm regards,<br/>The BookKeepers Team</p>
      `,
    });
    res.status(200).json({ message: "Send SuccessFully", id: user._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });
    if (!checkUser)
      return res.json({
        success: false,
        message: "User doesn't exists! Please register first",
      });
    if (checkUser.status == 0) {
      const otp = generateOTP();
      await User.updateOne({ _id: checkUser._id }, { $set: { otp: otp } });
      await sendMail({
        to: email,
        subject: "Your BookKeepers OTP for Email Verification",
        html: `
          <p>Hello ${userName},</p>
          <p>Thank you for registering with <strong>BookKeepers</strong>.</p>
          <p>Please use the following One-Time Password (OTP) to verify your email address:</p>
          <p style="font-size: 18px;"><strong>${otp}</strong></p>
          <p>This OTP is valid for 10 minutes. If you did not request this, you can safely ignore this email.</p>
          <p>Warm regards,<br/>The BookKeepers Team</p>
        `,
      });
      return res.status(403).json({
        success: false,
        status: 0,
        id: checkUser._id,
        message: "Account not verified. OTP sent.",
      });
    } else {
      const checkPasswordMatch = await bcrypt.compare(
        password,
        checkUser.password
      );
      if (!checkPasswordMatch)
        return res.json({
          success: false,
          message: "Incorrect password! Please try again",
        });

      const token = jwt.sign(
        {
          id: checkUser._id,
          role: checkUser.role,
          email: checkUser.email,
          userName: checkUser.userName,
        },
        "CLIENT_SECRET_KEY",
        { expiresIn: "60m" }
      );

      res.status(200).json({
        success: true,
        message: "Logged in successfully",
        token,
        user: {
          email: checkUser.email,
          role: checkUser.role,
          id: checkUser._id,
          userName: checkUser.userName,
        },
      });
    }
    // const checkPasswordMatch = await bcrypt.compare(
    //   password,
    //   checkUser.password
    // );
    // if (!checkPasswordMatch)
    //   return res.json({
    //     success: false,
    //     message: "Incorrect password! Please try again",
    //   });

    // const token = jwt.sign(
    //   {
    //     id: checkUser._id,
    //     role: checkUser.role,
    //     email: checkUser.email,
    //     userName: checkUser.userName,
    //   },
    //   "CLIENT_SECRET_KEY",
    //   { expiresIn: "60m" }
    // );

    // res.cookie("token", token, { httpOnly: true, secure: true }).json({
    //   success: true,
    //   message: "Logged in successfully",
    //   user: {
    //     email: checkUser.email,
    //     role: checkUser.role,
    //     id: checkUser._id,
    //     userName: checkUser.userName,
    //   },
    // });

    // res.status(200).json({
    //   success: true,
    //   message: "Logged in successfully",
    //   token,
    //   user: {
    //     email: checkUser.email,
    //     role: checkUser.role,
    //     id: checkUser._id,
    //     userName: checkUser.userName,
    //   },
    // });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Some error occured",
    });
  }
};

//logout

const logoutUser = (req, res) => {
  res.clearCookie("token").json({
    success: true,
    message: "Logged out successfully!",
  });
};

//auth middleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token)
    return res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });

  try {
    const decoded = jwt.verify(token, "CLIENT_SECRET_KEY");
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Unauthorised user!",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  verifyOtp,
  resendOtp,
};
