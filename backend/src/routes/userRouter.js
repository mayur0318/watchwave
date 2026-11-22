import { Router } from "express";
import {
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateAccountDetails,
  updateUserAvatar,
  updateCoverImage,
  updateCurrentPassword,
  getCurrentUser,
  getUserChannelProfile,
  getWatchHistory,
  updateTheme,
} from "../controllers/userController.js";
import { upload } from "../middlewares/multerMiddleware.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, updateCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router
  .route("/update-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router
  .route("/update-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/theme").patch(verifyJWT, updateTheme);

router.route("/c/:userName").get(verifyJWT, getUserChannelProfile);
router.route("/history").get(verifyJWT, getWatchHistory);

export default router;
