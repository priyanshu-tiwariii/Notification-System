import { Resend } from "resend";
import dotenv from 'dotenv'
dotenv.config();
const API_KEY = process.env.RESEND_API_KEY || "your-";
if(!API_KEY) {
    throw new Error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(API_KEY);


export const sendMail = async (
    to: string,
    subject: string,
    text: string,
    
) =>{
   try {
      const {data, error } = await resend.emails.send({
                 from: "Your App <onboarding@resend.dev>",
                 to: to,
                 replyTo: to,
                 subject: subject || 'Default Subject',
                 text: text || 'Default message content',
             })
        if (error) {
            console.error("Error sending email:", error);
            throw new Error("Failed to send email");
        }
        console.log("Email sent successfully:", data);
        return data;
   } catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
   }
}