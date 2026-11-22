export type LoginErrors = {
  email?: string;
  password?: string;
};

type LoginValues = {
  email: string;
  password: string;
};

const emailPattern = /^\S+@\S+\.\S+$/;

export function validateLogin(values: LoginValues): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email";
  }

  if (!values.password) {
    errors.password = "Password is required";
  }

  return errors;
}

export type RegisterErrors = {
  fullName?: string;
  userName?: string;
  email?: string;
  password?: string;
  avatar?: string;
  coverImage?: string;
};

type RegisterValues = {
  fullName: string;
  userName: string;
  email: string;
  password: string;
  avatar: File | null;
  coverImage: File | null;
};

const userNamePattern = /^[a-z0-9_]{3,20}$/;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 MB

function checkImage(file: File): string | undefined {
  if (!file.type.startsWith("image/")) {
    return "File must be an image";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Image must be 5 MB or smaller";
  }
  return undefined;
}

export function validateRegister(values: RegisterValues): RegisterErrors {
  const errors: RegisterErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = "Full name is required";
  }

  const userName = values.userName.trim().toLowerCase();
  if (!userName) {
    errors.userName = "Username is required";
  } else if (!userNamePattern.test(userName)) {
    errors.userName = "3-20 characters: letters, numbers or underscore";
  }

  const email = values.email.trim();
  if (!email) {
    errors.email = "Email is required";
  } else if (!emailPattern.test(email)) {
    errors.email = "Enter a valid email";
  }

  if (!values.password) {
    errors.password = "Password is required";
  } else if (
    values.password.length < 8 ||
    !/[A-Za-z]/.test(values.password) ||
    !/\d/.test(values.password)
  ) {
    errors.password = "At least 8 characters, with a letter and a number";
  }

  if (!values.avatar) {
    errors.avatar = "Profile picture is required";
  } else {
    const message = checkImage(values.avatar);
    if (message) errors.avatar = message;
  }

  if (values.coverImage) {
    const message = checkImage(values.coverImage);
    if (message) errors.coverImage = message;
  }

  return errors;
}

export type UploadErrors = {
  title?: string;
  description?: string;
  videoFile?: string;
  thumbnail?: string;
};

type UploadValues = {
  title: string;
  description: string;
  videoFile: File | null;
  thumbnail: File | null;
};

const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100 MB

export function validateUpload(values: UploadValues): UploadErrors {
  const errors: UploadErrors = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = "Title is required";
  } else if (title.length > 100) {
    errors.title = "Title must be 100 characters or fewer";
  }

  if (!values.description.trim()) {
    errors.description = "Description is required";
  }

  if (!values.videoFile) {
    errors.videoFile = "Video file is required";
  } else if (!values.videoFile.type.startsWith("video/")) {
    errors.videoFile = "File must be a video";
  } else if (values.videoFile.size > MAX_VIDEO_SIZE) {
    errors.videoFile = "Video must be 100 MB or smaller";
  }

  if (!values.thumbnail) {
    errors.thumbnail = "Thumbnail is required";
  } else {
    const message = checkImage(values.thumbnail);
    if (message) errors.thumbnail = message;
  }

  return errors;
}
