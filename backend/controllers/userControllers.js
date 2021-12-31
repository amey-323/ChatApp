const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const generateToken = require("../config/generateToken");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.REACT_APP_CLIENT_ID);

const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic } = req.body;
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Please enter all the fields");
  }

  const userExists = await User.findOne({ email: email });
  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    pic,
  });
  console.log(user);

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Failed to create user");
  }
});

const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  console.log(user);
  if (user && (await user.matchPassword(password))) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid username or password!");
  }
});

const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

const authGoogle = asyncHandler(async (req, res) => {
  const { idToken, googleId } = req.body;
  if (!idToken || !googleId) {
    res.status(401);
    throw new Error("Unauthorized: Token Id or google Id not found");
  }
  try {
    const result = await client.verifyIdToken({
      idToken,
      audience: process.env.REACT_APP_CLIENT_ID,
    });
    const { name, email, picture } = result.payload;
    const queryResult = await User.findOne({ email: email });
    if (queryResult && !queryResult.pic) {
      const updatePic = await User.findOneAndUpdate(
        { email },
        { pic: picture },
        { new: true }
      );
      return res.status(201).json({
        _id: updatePic._id,
        name: updatePic.name,
        email: updatePic.email,
        pic: updatePic.pic,
        token: generateToken(updatePic._id),
      });
    }

    if (queryResult && queryResult.pic) {
      return res.status(201).json({
        _id: queryResult._id,
        name: queryResult.name,
        email: queryResult.email,
        pic: queryResult.pic,
        token: generateToken(queryResult._id),
      });
    }

    if (!queryResult) {
      const password = googleId + (process.env.JWT_SECRET || "");
      const user = await User.create({
        name,
        email,
        password,
        pic: picture,
      });
      console.log(user);

      if (user) {
        res.status(201).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          pic: user.pic,
          token: generateToken(user._id),
        });
      } else {
        res.status(400);
        throw new Error("Failed to create user");
      }
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    throw new Error(error.message);
  }
});
module.exports = { registerUser, authUser, authGoogle, allUsers };
