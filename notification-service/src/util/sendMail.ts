import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || 're_hFd3b9AL_G4e2Hs7wKGZDcyY3D1YJ3YTx');


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

             console.log("API KEY :", process.env.RESEND_API_KEY);
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