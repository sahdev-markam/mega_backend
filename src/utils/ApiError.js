class ApiError extends Error {
  constructor(
    statusCode,
    message= "Somthing went wrong",
    error=[],
    stack = ""
  ){
    super(message)
    this.statusCode = statusCode
    this.data = null //asinment for studying
    this.message = message
    this.success = false;
    this.errors = error
    if (stack) {
      this.stack = stack
    }else {
      Error.captureStackTrace(this,this.constructor)
    }
  }
}

export default ApiError