import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

app.use((req, res, next) => {
  // console.log("REQUEST:", req.method, req.originalUrl);
  next();
});

//Imports Router
import userRouter from "./routes/userRouter.js";
import videoRouter from "./routes/videoRouter.js";
import subscriptionRouter from "./routes/subscriptionRouter.js";
import likeRouter from "./routes/likeRouter.js";
import commentRouter from "./routes/commentRouter.js";
import playlistRouter from "./routes/playlistRouter.js";
import tweetRouter from "./routes/tweetRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";

app.use("/api/v1/user", userRouter);
app.use("/api/v1/video", videoRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/likes", likeRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/tweets", tweetRouter);
app.use("/api/v1/dashboard", dashboardRouter);

export { app };
