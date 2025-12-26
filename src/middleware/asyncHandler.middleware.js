const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// const asyncHandler = (fn) => {
//   return (req, res, next) => {
//     try {
//       fn(req, res, next)
//     } catch (error) {
//       next(error)
//     }
//   }
// }

export default asyncHandler;
