const router = require("express").Router();

const {
  twitterLoginController,
  twitterLoginCallbackController,
  twitterTokenRefreshController,
  twitterTweetPostController,
  twitterUserDataController,
} = require("../controller/twitterController");

router.get("/login", twitterLoginController);
router.get("/callback", twitterLoginCallbackController);
router.get("/refreshToken", twitterTokenRefreshController);
router.get("/tweet", twitterTweetPostController);
router.get("/user-data", twitterUserDataController);

module.exports = router;
