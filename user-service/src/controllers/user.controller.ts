import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { use } from "hono/jsx";
import type { tryDecode } from "hono/utils/url";
import {z} from "zod";
import User from "../models/user.model.js";
import { client } from "../index.js";


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
        })
    ),
    async(c)=>{
        const { userName, email, password } = c.req.valid("json");
        try {
            await User.create({
                userName,
                email,
                password,
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
.get("/", (c) => {
   return c.json({
    message: "Hello from the user service!",
    timestamp: new Date().toISOString(),
    });
}
);

export default app;