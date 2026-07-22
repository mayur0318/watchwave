import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { uploadOnCloudinary } from "../utils/cloudinary";
import { Video } from "../models/videoModels";
import { ApiResponse } from "../utils/ApiResponse";
import { User } from "../models/userModels";

const getAllVideos = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

  // Step 1: build match conditions
  const matchStage = { isPublished: true };

  if (query) {
    matchStage.title = { $regex: query, $options: "i" };
  }

  if (userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new ApiError(400, "Invalid userId");
    }
    matchStage.owner = new mongoose.Types.ObjectId(userId);
  }

  // Step 2: run the aggregation pipeline
  const videos = await Video.aggregate([
    {
      $match: matchStage,
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              fullName: 1,
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
    {
      $sort: {
        [sortBy || "createdAt"]: sortType === "asc" ? 1 : -1,
      },
    },
    {
      $skip: (Number(page) - 1) * Number(limit),
    },
    {
      $limit: Number(limit),
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, videos, "Videos fetched successfully"));
});

const publishAVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;

  if ([title, description].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Title and Description are requried!");
  }

  const videoFileLocalPath = req.files?.videoFile?.[0]?.path;
  const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

  if (!videoFileLocalPath) {
    throw new ApiError(400, "Video File is required");
  }

  if (!thumbnailLocalPath) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const [videoFile, thumbnail] = await Promise.all([
    uploadOnCloudinary(videoFileLocalPath),
    uploadOnCloudinary(thumbnailLocalPath),
  ]);

  if (!videoFile) {
    throw new ApiError(400, " Video File is required");
  }

  if (!thumbnail) {
    throw new ApiError(400, "Thumbnail is required");
  }

  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.url,
    thumbnail: thumbnail.url,
    duration: videoFile.duration,
    isPublished: true,
    owner: req.user._id,
  });

  if (!video) {
    throw new ApiError(500, "Something went wront while publishing video");
  }

  return res
    .status(200)
    .json(new ApiResponse(201, video, "Video is published successfully!!"));
});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: { fullName: 1, userName: 1, avatar: 1 },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: { $first: "$owner" },
      },
    },
  ]);

  if (!video?.length) {
    throw new ApiError(404, "Video Not Found!");
  }

  await Promise.all([
    Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }),
    User.findByIdAndUpdate(req.user._id, {
      $addToSet: { watchHistory: videoId },
    }),
  ]);

  //   await Video.findByIdAndUpdate(videoId, {
  //     $inc: { views: 1 },
  //   });

  //   await User.findByIdAndUpdate(req.user._id, {
  //     $addToSet: { watchHistory: videoId },
  //   });

  return res
    .status(200)
    .json(new ApiResponse(200, video[0], "Video fetched Successfully!!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const { title, description } = req.body;

  if (!title && !description && !req.file) {
    throw new ApiError(400, "At least one field is required to update");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video not found");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  const updateFields = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;

  const thumbnailLocalPath = req.file?.path;

  if (thumbnailLocalPath) {
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if (!thumbnail) {
      throw new ApiError(400, "Error while uploading thumbnail");
    }

    updateFields.thumbnail = thumbnail.url;

    if (video.thumbnail) {
      const oldThumbnailPublicId = video.thumbnail
        .split("/")
        .pop()
        .split(".")[0];
      await cloudinary.uploader.destroy(oldThumbnailPublicId);
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(
    videoId,
    { $set: updateFields },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid VideoId");
  }

  const video = await findById(videoId);
  if (!video) {
    throw new ApiError(404, "Video is not found in DB");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this video");
  }

  if (video.thumbnail) {
    const thumbnailPublicId = video.thumbnail.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(thumbnailPublicId);
  }

  if (video.videoFile) {
    const videoPublicId = video.videoFile.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(videoPublicId, {
      resource_type: "video",
    });
  }

  await Video.findByIdAndDelete(videoId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video Deleted Successfully!!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(videoId)) {
    throw new ApiError(400, "Invalid videoId");
  }

  const video = await Video.findById(videoId);

  if (!video) {
    throw new ApiError(404, "Video is not Found in DB");
  }

  if (video.owner.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to update this video");
  }

  video.isPublished = !video.isPublished;

  await video.save();

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Publish status toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
