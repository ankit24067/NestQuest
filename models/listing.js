const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./reviews");
const { string, required } = require("joi");
const listingSchema = new Schema({
   title:{
      type:String,
      required: true,

   } ,
   description: String,
   image: {
     url: String,
     filename:String,
   },
   price: Number,
   location: String,
   country: String,
   reviews: [{
      type:Schema.Types.ObjectId,
      ref:"Review",
   }],
   owner :{
      type: Schema.Types.ObjectId,
      ref: "User",
   },
   geometry:{
    type: {
      type: String, // Don't do `{ location: { type: String } }`
      enum: ['Point'], // 'location.type' must be 'Point'
      default: 'Point',
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  category:{
   type:String,
   enum: ["trending","rooms","iconic-cities","mountains","amazing-pools","castle","camping","farms","hill-stations","arctic","domes","boats"],
  }
});

listingSchema.post("findOneAndDelete",async(listing)=>{
   if(listing){
      await Review.deleteMany({_id:{$in:listing.reviews}});

   };
});

const Listing = mongoose.model("Listing", listingSchema)
module.exports = Listing;