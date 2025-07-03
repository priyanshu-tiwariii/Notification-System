import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { sendMail } from "../util/sendMail.js";
const app = new Hono()
.post("/send-otp",
    zValidator("json",
        z.object({
            email : z.string().email("Invalid email address"),
        })
    ),
    async(c)=>{
        const { email } = c.req.valid("json");
        try {
            console.log("Sending notification to:", email);
            const res = await sendMail(
                email,
                "Welcome to our service!",
                "Your OTP is 123456. Please use this to complete your registration."
            )
            if (!res) {
                return c.json({
                    error: "Failed to send notification",
                }, 500);
            }
            console.log("Notification sent successfully:", res);

            return c.json({
                message: "Notification sent successfully",
                email,
            }, 200);

        } catch (error) {
            console.error("Error sending OTP:", error);
            return c.json({
                error: "Failed to send OTP",
                details: error instanceof Error ? error.message : "Unknown error"
            }, 500);
        }
    }
    )
export const notificationRoutes = app;