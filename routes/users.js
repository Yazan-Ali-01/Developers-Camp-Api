const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  getUsers,
  getUser,
  addUser,
  updateUser,
  deleteUser,
} = require("../controllers/users");
const { protect, authorize } = require("../middleware/auth");

const User = require("../models/User");
const advancedResults = require("../middleware/advancedResults");

router.use(protect);
router.use(authorize("admin"));

router.route("/").get(advancedResults(User), getUsers).post(addUser);

router.route("/:id").get(getUser).put(updateUser).delete(deleteUser);
module.exports = router;
