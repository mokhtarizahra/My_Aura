import { authErrors } from "../errors/authErrors.js";

export const generateOTP = (length = 4) => {
  if (!Number.isInteger(length) || length < 4) {
    throw authErrors.otpLengthInvalid();
  }

  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;

  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};