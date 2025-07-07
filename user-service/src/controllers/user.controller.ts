import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { use } from "hono/jsx";
import type { tryDecode } from "hono/utils/url";
import {z} from "zod";
import User from "../models/user.model.js";
import { client, queue } from "../index.js";


const app = new Hono()
.post("/register/send-otp",
    zValidator("json",
        z.object({
            email: z.string().email("Invalid email address"),
        })
    ),
    async (c) => {
        const { email } = c.req.valid("json");
        try {

            const res = await client.api.v1.notification["send-otp"].$post({
                json: { 
                    email:email
                },   
            })

            if (!res.ok) {
                const error = await res.text();
                console.error("User service error:", error);
                return c.json({ error: "Failed to send OTP" }, 500);
            }

            return c.json({
                message: "OTP sent successfully",
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
.post("/register",
     zValidator(
        "json",
        z.object({
            userName: z.string().min(3, "Username must be at least 3 characters long"),
            email: z.string().email("Invalid email address"),
            password: z.string().min(6, "Password must be at least 6 characters long"),
            otp: z.number().min(1, "OTP is required"),
        })
    ),
    async(c)=>{
        const { userName, email, password, otp } = c.req.valid("json");
        if(otp != 123456) {
            return c.json({
                error: "Invalid OTP",
            }, 400);
        }
        try {
            const user =  await User.findOne({userName});
            if (user) {
                return c.json({
                    error: "Username already exists",
                }, 400);
            }
            await User.create({
                userName,
                email,
                password,
            });

            queue.add("email-queue", {
                to: email,
                subject: "Welcome to our service!",
                text: `Hello ${userName},\n\nThank you for registering! Your account has been created successfully.\n\nBest regards,\nYour Service Team`
            });
            
            return c.json({
                message: "User registered successfully",
                userName,
                email,
            }, 201);
            
        } catch (error) {
            console.error("Error registering user:", error);
            return c.json({
                error: "Failed to register user",
                details: error instanceof Error ? error.message : "Unknown error"
            }, 500);
            
        }
    
})
.get("/user", async (c) => {
    const userName = c.req.query("userName");
    if (!userName) {
        return c.json({ error: "Missing userName parameter" }, 400);
    }
    const users = await User.find({ userName });
    const user = Array.isArray(users) ? users[0] : users;
    if (!user) {
        return c.json({ error: "User not found" }, 404);
    }
    return c.json({
        message: "User fetched successfully",
        user: {
            userName: user.userName,
            email: user.email,
        },
    }, 200);

}
);

export default app;