class ApiResponse{
   constructor(statusCode, data, message = "Request was successful", success = true) {
      this.statusCode = statusCode; // HTTP status code
      this.data = data; // data to be sent in the response
      this.message = message; // message to be sent in the response
      this.success = statusCode < 400; // boolean indicating success or failure of the request
   }
}

export default ApiResponse;
