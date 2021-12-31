const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  authGoogle,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").post(registerUser).get(protect, allUsers);
router.post("/login", authUser);
router.post("/google", authGoogle);

module.exports = router;
