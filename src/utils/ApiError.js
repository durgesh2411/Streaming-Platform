class ApiError extends Error {
   constructor(
      statusCode,
      errors =[],
      stack = "",
      message = "Something went wrong") {
      super(message);
      this.statusCode = statusCode;
      this.data = null;    // read abt it
      this.success = false;
      this.errors = errors; // array of error messages

      if(stack){
         this.stack = stack; // stack trace for debugging
      }
      else{
         Error.captureStackTrace(this, this.constructor); // capture stack trace if not provided
      }
   }
}
export default ApiError;
