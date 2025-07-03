import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);


export const sendMail = async (
    to: string,
    subject: string,
    text: string,
    from: string 
) =>{
   try {
      const {data, error } = await resend.emails.send({
                 from: from || '',
                 to: to,
                 replyTo: from || '',
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