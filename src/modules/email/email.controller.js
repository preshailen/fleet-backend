import { sendEmail } from './email.service.js';


const sendemail = async (req, res) => {
  try {
    const { email } = req.body;
    const response = await sendEmail({
      to: email,
      subject: "Welcome to our platform",
      html: null
    });
    res.send({ success: true, response: response });
  } catch (err) {
    res.status(500).send({ error: "Email failed" });
  }
};
export default { sendemail };