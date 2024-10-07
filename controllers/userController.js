const catchAsync = require('../ults/catchAsync');
const User = require('../models/userModel');
const AppError = require('../ults/appError');
const factory = require('./handleFactory');
const multer = require('multer');
const sharp = require('sharp');
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cd) => {
//     cd(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });
const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(AppError('Not image! Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadUserPhoto = upload.single('photo');
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
exports.getAllUsers = factory.getAll(User);
// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();
//   res.status(200).json({
//     status: 'success',
//     results: users.length,
//     data: {
//       users,
//     },
//   });
// });
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  //1.Create error if user post password data
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password updates, please use/updateMyPassword',
        400,
      ),
    );
  }

  //2.filter out that are not allow to update
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;
  //3. update user document
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});
exports.getUser = factory.getOne(User);
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'Error',
    message: 'Please use signUp route',
  });
};
// const patchUser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This route is not yet defined',
//   });
// };
exports.deleteUser = factory.deleteOne(User);

//do not use this to update password
exports.updateUser = factory.updateOne(User);

// exports.deleteUser = catchAsync(async (req, res, next) => {
//   await User.findByIdAndUpdate(req.user.id, { active: false });
//   res.status(204).json({
//     status: 'Success',
//     message: 'This user was deleted',
//   });
// });
// exports.updateUser = (req, res) => {
//   res.status(500).json({
//     status: 'Error',
//     message: 'This route is not yet defined',
//   });
// };
