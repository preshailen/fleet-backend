import 'dotenv/config';
import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_ADDRESS, pass: process.env.EMAIL_PASSWORD}
});


export const sendEmail = async ({to, subject, html}) => {
  try {
    const response = await transporter.sendMail({
      from: "ruthnampresh@gmail.com",
      to: to,
      subject: subject,
      html: html
    });
    return response;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
}