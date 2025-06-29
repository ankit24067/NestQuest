const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const wrapAsync = require("../utils/wrapAsync");
const{isLoggedIn, isOwner, validateListing} = require("../middleware");
const ExpressError = require("../utils/ExpressError");
const listingController = require("../controller/listings");
const multer = require("multer");
const {storage} = require("../cloudConfig");
const upload = multer({storage});


// ✏️ Edit Route - render edit form
router.get("/:id/edit",isLoggedIn,isOwner, wrapAsync(listingController.editListing));

router.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    return res.redirect("/listings");
  }

  try {
    const listings = await Listing.find({
      $or: [
        { location: { $regex: q, $options: "i" } },
        { country: { $regex: q, $options: "i" } }
      ]
    });

    res.render("listings/index", { allListings: listings, q });
  } catch (err) {
    console.error("Search error:", err);
    res.redirect("/listings");
  }
});

router.get("/category/:category", async (req, res) => {
  const { category } = req.params;
  try {
    const listings = await Listing.find({ category });
    res.render("listings/index", { allListings: listings, selectedCategory: category });
  } catch (err) {
    console.error("Category filter error:", err);
    res.redirect("/listings");
  }
});


router.route("/")
.get( wrapAsync(listingController.index))
.post(isLoggedIn,upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));


// 🆕 New Route - show form
router.get("/new",isLoggedIn, listingController.renderNewForm);

router.route("/:id")
.get(wrapAsync(listingController.showListings))
.put(isLoggedIn,isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
.delete(isLoggedIn,isOwner, wrapAsync(listingController.distroyListing));




module.exports = router;