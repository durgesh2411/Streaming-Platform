
//                           1. promises wala Implementation:

const asyncHandler = (requestHandler) =>{
   return (req, res, next) => {
   Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err))
}
}
export { asyncHandler };



//                            2. Try-catch wala Implementation:
//const asyncHandler = () =>{}                      // sandhiviched of  high order function
// const asyncHandler = (func) =>{() =>{}}

// const asyncHandler = (fn) => async(req, res, next) => {  // high order function
//    try{
//       await fn(req, res, next)  // await the function passed to asyncHandler
//       // if the function executes successfully, it will return a response
//       // if it throws an error, it will be caught by the catch block
//    }
//    catch(err){
//       res.status(err.code || 500).json({
//          success: false,
//          message: err.message || "Internal Server Error",
//       })
//    }
// }
