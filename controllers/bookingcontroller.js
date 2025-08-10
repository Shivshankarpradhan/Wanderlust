const booking = require("../models/booking");

const createBooking = async (req, res) => {
  const { listingId, checkIn, checkOut, guests } = req.body.booking;
  const newBooking = new booking({
    user: req.user._id,
    listing: listingId,
    checkIn,
    checkOut,
    guests,
  });
  await newBooking.save();
  req.flash("success", "Your booking was successful!");
  res.redirect(`/listings/${listingId}`);
};

const showBookings = async (req, res) => {
  const bookings = await booking.find({ user: req.user._id }).populate("listing");
  res.render("booking/bookings", { bookings, page: "allListingPage" });
};

const deleteBooking = async (req, res) => {
  const { id } = req.params;
  const existingBooking = await booking.findById(id);

  if (!existingBooking) {
    req.flash("error", "Booking not found.");
    return res.redirect("/bookings");
  }

  const now = new Date();
  const oneDayBeforeCheckIn = new Date(existingBooking.checkIn);
  oneDayBeforeCheckIn.setDate(oneDayBeforeCheckIn.getDate() - 1);

  if (now > oneDayBeforeCheckIn) {
    req.flash("error", "You can only cancel at least 1 day before check-in.");
    return res.redirect("/bookings");
  }

  await booking.findByIdAndDelete(id);
  req.flash("success", "Booking canceled successfully.");
  res.redirect("/bookings");
};

module.exports = {
  createBooking,
  showBookings,
  deleteBooking,
};
