import { Router } from "express";
import {
  toggleSubscription,
  getUserChannelSubscribers,
  getSubscribedChannels,
} from "../controllers/subscriptionController.js";
import { verifyJWT } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(verifyJWT);

router
  .route("/c/:channelId")
  .post(toggleSubscription)
  .get(getUserChannelSubscribers);

router.route("/u/:subscriberId").get(getSubscribedChannels);

export default router;
