const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Course = require("../models/Course");
const { default: mongoose } = require("mongoose");
const Bootcamp = require("../models/Bootcamp");
const advancedResults = require("../middleware/advancedResults");

// @desc   Get all courses
// @route  GET /api/v1/courses
// @route  GET /api/v1/bootcamps/:bootcampId/courses
// @access Public
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId,
    });
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc   Get a single course
// @route  GET /api/v1/courses/:id
// @access Public
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: " name description",
  });
  if (!course) {
    return next(
      new ErrorResponse(`No course with the ID of ${req.params.id}`),
      404
    );
  }
  res.status(200).json({
    success: 200,
    data: course,
  });
});

// @desc   Add a single course
// @route  POST /api/v1/bootcamps/:bootcampId/courses
// @access Private
exports.addCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No bootcamp with the ID of ${req.params.bootcampId}`),
      404
    );
  }
  //Make sure the user is the bootcamp owner
  if (req.user.id !== bootcamp.user.toString() && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ID of ${req.user.id} can't add courses to bootcamp because it doesn't belong to him`,
        401
      )
    );
  }
  const course = await Course.create(req.body);
  res.status(200).json({
    success: 200,
    data: course,
  });
});

// @desc   Update a specific course
// @route  PUT /api/v1/courses/:id
// @access Private
exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No Courses with the ID of ${req.params.bootcampId}`),
      404
    );
  }
  //Make sure the user is the bootcamp owner
  if (course.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(
      new ErrorResponse(
        `User with ID of ${req.user.id} can't add courses to bootcamp because it doesn't belong to him`,
        401
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    success: 200,
    data: course,
  });
});

// @desc   Delete a specific course
// @route  Delete /api/v1/courses/:id
// @access Private
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No Courses with the ID of ${req.params.bootcampId}`),
      404
    );
  }
  await course.remove();
  res.status(200).json({
    success: 200,
    data: {},
  });
});
