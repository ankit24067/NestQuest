const express = require("express");
const router = express.Router({ mergeParams: true }); // ✅ Important fix
const wrapAsync = require("../utils/wrapAsync");
const Review = require("../models/reviews");
const Listing = require("../models/listing");
const { validateReview, isLoggedIn } = require("../middleware");
const ExpressError = require("../utils/ExpressError");
const reviewsController = require("../controller/reviews");


// POST Review
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewsController.createReviews));

// DELETE Review
router.delete("/:reviewId",isLoggedIn , wrapAsync(reviewsController.destroyReview));

module.exports = router;
