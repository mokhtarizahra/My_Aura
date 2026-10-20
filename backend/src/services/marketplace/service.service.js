import axios from "axios";

export const sendSMS = async (phone, code) => {
  try {
    const response = await axios.post(
      "https://api.sms.ir/v1/send/verify",
      {
        mobile: phone,

        templateId: Number(process.env.SMS_TEMPLATE_ID),

        parameters: [
          {
            name: "Code",
            value: code,
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",

          Accept: "text/plain",

          "x-api-key": process.env.SMS_API_KEY,
        },
      },
    );

    return response.data;
  } catch {
    throw new Error("SMS sending failed");
  }
};

export const sendEmailOTP = async (email, code) => {
  return {
    email,
    code,
    success: true,
  };
};
