function errorResult(error) {
  return { status: "error", error };
}
function successResult(data) {
  return { status: "success", data };
}
function successError(error, data) {
  return error ? errorResult(error) : successResult(data);
}
module.exports = {
  errorResult,
  successResult,
  successError,
};
