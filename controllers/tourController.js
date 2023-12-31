/* eslint-disable no-await-in-loop */
const multer = require("multer");
const Jimp = require("jimp");

const Tour = require("../models/tourModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new CustomError("Only image uploads are allowed", 400));
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadTourImages = upload.fields([
  { name: "imageCover", maxCount: 1 },
  { name: "images", maxCount: 3 }
]);

exports.resizeTourImages = catchAsyncError(async (req, res, next) => {
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;

  // 1) Process image cover
  const image = await Jimp.read(req.files.imageCover[0].buffer);
  await image
    .cover(2000, 1333) // resize the image to 3:2 ratio˝
    .quality(90) // set the quality of JPEG
    .writeAsync(`public/img/tours/${req.body.imageCover}`); // save as JPEG

  // 2) Process other images
  req.body.images = [];

  for (let i = 0; i < req.files.images.length; i += 1) {
    const file = req.files.images[i];
    const imageName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

    const processedImage = await Jimp.read(file.buffer);
    await processedImage
      .cover(2000, 1333)
      .quality(90)
      .writeAsync(`public/img/tours/${imageName}`);

    req.body.images.push(imageName);
  }

  next();
});

// incase of only images property with maxCount we can use the below array
// upload.array('images', 3)

exports.getTop5AffordableQuery = async (req, res, next) => {
  req.query = {
    page: 1,
    limit: 5,
    sort: "price,-ratingsAverage",
    projection: "_id,name,price,ratingsAverage,description,difficuilty"
  };
  next();
};

exports.getAllTours = factory.getAll(Tour);
exports.getUniqueTour = factory.getOne(Tour, ["reviews"]);
exports.addNewTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);

exports.getTourStats = catchAsyncError(async (req, res) => {
  const stats = await Tour.aggregate([
    {
      $match: {
        ratingsAverage: { $gte: 4.5 }
      }
    },
    {
      $group: {
        _id: "$difficulty", // null if we want to group it to single document
        // _id: { $toUpper: "$difficulty" } // converts the obtained string to uppercase
        avgRating: { $avg: "$ratingsAverage" },
        avgPrice: { $avg: { $round: "$price" } },
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
        ratingsCount: { $sum: "$ratingsQuantity" },
        toursCount: { $sum: 1 } // why 1? for each doc we will add 1 to the toursCount property
      }
    },
    {
      $sort: { minPrice: 1 }
    }
    // we can rewrite stages again if we want
    // {
    //   $match: { _id: { $ne: "easy" } }
    // }
  ]);

  res.status(200).json({
    status: "success",
    data: {
      stats
    }
  });
});

// eslint-disable-next-line consistent-return
exports.getMonthlyTourAnalytics = catchAsyncError(async (req, res) => {
  const year = Number(req.query.year);

  if (!year) {
    return res.status(400).json({
      error: "Year is required!",
      message: "Year is required!"
    });
  }

  const stats = await Tour.aggregate([
    { $unwind: "$startDates" },
    {
      $match: {
        startDates: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${year + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: "$startDates" },
        numberOfToursStarting: { $sum: 1 },
        tours: {
          $push: "$name"
        }
      }
    },
    { $addFields: { month: "$_id" } },
    { $project: { _id: 0 } },
    {
      $sort: { numberOfToursStarting: -1 }
    },
    { $limit: 3 } // limiting it to only top 3
  ]);

  if (stats.length < 1) {
    return res.status(404).json({
      error: "No records found for provided year.",
      message: "No records found for provided year."
    });
  }

  res.status(200).json({
    status: "success",
    data: {
      stats
    }
  });
});

// /tours-within/:distance/center/:latlong/unit/:unit

exports.getToursWithin = catchAsyncError(async (req, res, next) => {
  const { distance, latlong = "", unit } = req.params;
  const [latitude, longitude] = latlong.split(",");

  if (!latitude || !longitude) {
    return next(
      new CustomError(
        "Provide valid values in the format latitude,longitude",
        400
      )
    );
  }

  // divide the distance value by radius of Earth
  // mi -> miles km -> kilometers
  const radius = unit === "mi" ? distance / 3963.2 : distance / 6378.1;

  const tours = await Tour.find({
    startLocation: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radius]
      }
    }
  });

  res.status(200).json({
    status: "success",
    results: tours.length,
    data: {
      tours
    }
  });
});

exports.getDistances = catchAsyncError(async (req, res, next) => {
  const { latlong = "", unit } = req.params;
  const [latitude, longitude] = latlong.split(",");

  if (!latitude || !longitude) {
    return next(
      new CustomError(
        "Provide valid values in the format latitude,longitude",
        400
      )
    );
  }

  const distanceMultiplier = unit === "mi" ? 0.000621371 : 0.001;

  const distances = await Tour.aggregate([
    // IMP: $geoNear: always needs to be the first stage in geo aggrigations
    // IMP: atleast one field needs have geo spacial index configured, eg startLocation in our case
    {
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [Number(longitude), Number(latitude)]
        },
        distanceField: "distance",
        distanceMultiplier
      }
    },
    {
      $project: {
        distance: 1,
        name: 1
      }
    }
  ]);

  res.status(200).json({
    status: "success",
    results: distances.length,
    data: {
      distances
    }
  });
});
