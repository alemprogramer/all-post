const multer = require("multer");
const storage = multer.memoryStorage();
const uploader = multer({ storage: storage });


module.exports = uploader