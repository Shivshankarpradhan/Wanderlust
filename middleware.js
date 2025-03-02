const Listing = require("./models/listing.js");
  const Review  = require("./models/review.js");
const ExpressError = require("./util/ExpressError.js");
const {listeningSchema ,reviewSchema } = require("./schema.js");


module.exports.isLoggedIn = (req ,res , next) =>{ 

    if(!req.isAuthenticated()){
        req.session.redirectUrl= req.originalUrl;
        req.flash("error" , "You must be logged in to create listing!");
         return res.redirect("/login");
      }
      next();
};

module.exports.saveRedirectUrl =(req ,res ,next)=>{
  if(req.session.redirectUrl){
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};

module.exports.isOwner = async(req , res , next) =>{
  let{id} = req.params;
  let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)){
      req.flash("error" , "You don't have permission to edit");
     return  res.redirect(`/listings/${id}`);
    }
    next();
};


module.exports. validateSchema = ((req ,res , next) => {
  let {error} = listeningSchema.validate(req.body);
  if(error){
    let errormsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404,errormsg);
  }else{
    next();
  }
  
});

module.exports.validateReview = ((req ,res , next) => {
  let {error} = reviewSchema.validate(req.body);
  if(error){
    let errormsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(404,errormsg);
  }else{
    next();
  }
  
});

module.exports.isReviewAuthor = async(req , res , next) =>{
  let{ id ,reviewId} = req.params;
  let listing = await Listing.findById(reviewId);
    if(!review.author.equals(res.locals.currUser._id)){
      req.flash("error" , "You are not the author of this  review");
     return  res.redirect(`/listings/${id}`);
    }
    next();
};