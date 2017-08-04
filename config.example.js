module.exports = {
  "/test": {
    "token": "",
    "*": "./bin/test.sh",
    "push": "./bin/test.sh ${PROJECT_NAME}"
  }
}
