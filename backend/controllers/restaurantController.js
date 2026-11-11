const Restaurant = require("../models/restaurant");
const ErrorHandler = require("../utils/errorHandler");
const catchAsync = require("../middlewares/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const generateReviewSummary = (reviews = []) => {
  if (!reviews.length) {
    return {
      reviewSentiment: "No reviews",
      reviewSummaryBullets: [],
      reviewTopMentions: [],
    };
  }

  const positiveWords = ["good", "great", "best", "awesome", "delicious", "fresh", "amazing"];
  let positiveCount = 0;

  const keywords = {};

  reviews.forEach((r) => {
    const text = (r.Comment || "").toLowerCase();

    if (positiveWords.some((w) => text.includes(w))) {
      positiveCount++;
    }

    text.split(" ").forEach((word) => {
      if (word.length > 3) {
        keywords[word] = (keywords[word] || 0) + 1;
      }
    });
  });

  const sentiment =
    positiveCount > reviews.length / 2 ? "Positive" : "Mixed";

  const topMentions = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map((item) => item[0]);

  return {
    reviewSentiment: sentiment,
    reviewSummaryBullets: [
      "Based on user reviews analysis",
      "Food quality and taste are frequently mentioned",
      "Service feedback is mixed",
    ],
    reviewTopMentions: topMentions,
  };
};

exports.getAllRestaurants = catchAsync(async (req, res, next) => {
  const apiFeatures = new APIFeatures(Restaurant.find(), req.query)
    .search()
    .sort();

  const restaurants = await apiFeatures.query;

  res.status(200).json({
    status: "success",
    count: restaurants.length,
    restaurants,
  });
});
exports.createRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.create(req.body);
  res.status(201).json({
    status: "success",
    data: restaurant,
  });
});

//Get restaurant by id
exports.getRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findById(req.params.storeId);

  if (!restaurant)
    return next(new ErrorHandler("No Restaurant found with that ID", 404));

  res.status(200).json({
    status: "success",
    data: restaurant,
  });
});

exports.deleteRestaurant = catchAsync(async (req, res, next) => {
  const restaurant = await Restaurant.findByIdAndDelete(req.params.storeId);

  if (!restaurant)
    return next(new ErrorHandler("No document found with that ID", 404));

  res.status(204).json({
    status: "success",
  });
});
