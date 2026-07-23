import User from "../models/User.js";
import {generateOTP} from "../utils/generateOTP.js";
import {hashOTP} from "../utils/hashOTP.js";
import {sendSMS} from "./sms.service.js"

export const sendOTP = async (phone) => {
  const otp = generateOTP();
  console.log("OTP:", otp);

  const otpHash = await hashOTP(otp);
  const otpExpire = Date.now() + 2* 60 * 1000;

  let user = await User.findOne({phone});

  if (!user) {
    user = new User({phone});
  }

  user.otpHash = otpHash;
  user.otpExpire = otpExpire;

  await user.save();
  await sendSMS(phone , otp);

  return true;

};