const Joi = require('joi');

module.exports.listingSchema = Joi.object({
   listing:Joi.object({
      title:Joi.string().required(),
      description: Joi.string().required(),
      location: Joi.string().required(),
      country: Joi.string().required(),
      price:Joi.number().required(),
      image: Joi.string().allow("", null),
       category: Joi.string().valid(
            "trending",
            "rooms",
            "iconic-cities",
            "mountains",
            "amazing-pools",
            "castle",
            "camping",
            "farms",
            "hill-stations",
            "arctic",
            "domes",
            "boats"
         ).required()
   }).required()
});
module.exports.reviewSchema = Joi.object({
   review: Joi.object({
      rating: Joi.number().required().min(1).max(5),
      comment: Joi.string().required(),

   }).required(),
});