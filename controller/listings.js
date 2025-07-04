const Listing = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index", { allListings });
};



// module.exports.index = async (req, res) => {
//   const { search } = req.query;
//   let allListing;

//   if (search) {
//     allListing = await Listing.find({
//       $or: [
//         { title: new RegExp(search, "i") },
//         { location: new RegExp(search, "i") },
//       ]
//     });
//   } else {
//     allListing = await Listing.find({});
//   }

//   res.render("listings/index", { allListing });
// }

module.exports.renderNewForm = (req, res) => {
  res.render("listings/new");
};

module.exports.showListings = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing you requested fro does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show", { listing });
};

module.exports.editListing = async (req, res, next) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested fro does not exist!");
    return res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_200,w_300");
  res.render("listings/edit", { listing, originalImageUrl });
};

module.exports.createListing = async (req, res, next) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send()
  let url = req.file.path;
  let filename = req.file.filename;
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;
  newListing.image = { url, filename };
  newListing.geometry = response.body.features[0].geometry;
  let savedListing = await newListing.save();
  console.log(savedListing);
  req.flash("success", "New Listing Created!");
  res.redirect("/listings");
};

module.exports.updateListing = async (req, res) => {
  if (!req.body.listing) {
    throw new ExpressError(400, "Send valid data for listing");
  }
  const { id } = req.params;
  const updatedData = req.body.listing;
  if (updatedData.location) {
    let response = await geocodingClient
      .forwardGeocode({
        query: updatedData.location,
        limit: 1,
      })
      .send()
      if (response.body.features.length > 0) {
            updatedData.geometry = response.body.features[0].geometry; // Update geometry (coordinates)
        }
  }
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file != "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    
  }
  await listing.save();
  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.distroyListing = async (req, res) => {
  const { id } = req.params;
  const deletedListing = await Listing.findByIdAndDelete(id);
  if (!deletedListing) {
    throw new ExpressError(404, "Listing Not Found");
  }
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
