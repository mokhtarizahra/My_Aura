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
      }
    );

    console.log(response.data);

    return response.data;
  } catch (error) {
    console.error(
      "SMS Error:",
      error.response?.data || error.message
    );

    throw new Error("SMS sending failed");
  }
};


// export const sendSMS = async (phone, message) => {
// 	console.log("SMS TEST");
// 	console.log(phone);
// 	console.log(message);
//   };
  