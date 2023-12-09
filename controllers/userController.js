const multer = require("multer");
const Jimp = require("jimp");

const User = require("../models/userModel");
const catchAsyncError = require("../utils/catchAsyncError");
const CustomError = require("../utils/customError");
const factory = require("./handlerFactory");

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/img/users");
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split("/")[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   }
// });

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new CustomError("Only image uploads are allowed", 400));
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

// why single? -> refer https://www.npmjs.com/package/multer?activeTab=readme#singlefieldname
exports.uploadUserPhoto = upload.single("photo");

exports.resizeUserPhoto = catchAsyncError(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  // jimp(req.file.buffer)
  //   .resize(500, 500)
  //   .toFormat("jpeg")
  //   .jpeg({ quality: 90 })
  //   .toFile(`public/img/users/${req.file.filename}`);

  Jimp.read(req.file.buffer)
    .then(
      (image) =>
        image
          .cover(500, 500) // resize the image to 500x500
          .quality(90) // set the quality of JPEG
          .writeAsync(`public/img/users/${req.file.filename}`) // save as JPEG
    )
    .then(() => {
      next();
    })
    .catch((err) => {
      console.error(err);
      next(new CustomError(err.message, 500));
    });
});

exports.updateMe = catchAsyncError(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword)
    return next(
      new CustomError(
        "This route cannot be used for password updates, please use /updatePassword.",
        400
      )
    );

  const body = { email: req.body.email, name: req.body.name };
  if (req.file) body.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(
    // eslint-disable-next-line no-underscore-dangle
    req.user._id,
    body,
    { runValidators: true, new: true }
  );

  res.status(200).json({
    status: "success",
    data: { user }
  });
});

exports.deleteMe = catchAsyncError(async (req, res) => {
  // eslint-disable-next-line no-underscore-dangle
  await User.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: "success",
    message: "User deleted successfully"
  });
});

exports.getAllUsers = catchAsyncError(async (_, res) => {
  const users = await User.find({});

  res.json({
    results: users.length,
    data: {
      users
    }
  });
});

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getUser = factory.getOne(User);
