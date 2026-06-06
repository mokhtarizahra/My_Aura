import bcrypt from "bcrypt";

export const hashOTP = async (otp) => {
  return await bcrypt.hash(otp, 10);
};

export const compareOTP = async (otp, hash) => {
  return await bcrypt.compare(otp, hash);
};
