export function createError(status, message) {
  console.log(message);
  const customError = new Error();
  customError.status = status;
  customError.message = message;
  return customError;
}
