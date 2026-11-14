import { Router } from "express";
import { verifyJWT } from "../middlewares/authMiddleware.js";
import {
  getVideoComments,
  addComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

const router = Router();

router.use(verifyJWT);

router.route("/video/:videoId").get(getVideoComments).post(addComment);

router.route("/:commentId").patch(updateComment).delete(deleteComment);

export default router;
