import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { AppType } from '../../user-service/src/index.ts'
import { hc } from 'hono/client'
import { notificationRoutes } from './controllers/notification.controller.js'
import dotenv from 'dotenv'
import { Worker, Job } from 'bullmq'
import { sendMail } from './util/sendMail.js'
import { Redis } from 'ioredis'

export const connection = new Redis({
  maxRetriesPerRequest: null,
})

dotenv.config()

const app = new Hono().route('/api/v1/notification', notificationRoutes)

//RPC -> Implemented
const client = hc<AppType>('http://localhost:3002/')


const worker = new Worker("notification-queue", async (job: Job) => {
  console.log("Processing job:", job.id, "with data:", job.data);
  console.log("Job name:", job.name);
  if(job.name === "email-queue") {
    await sendMail(
      job.data.to,
      job.data.subject,
      job.data.text
    )
  }
},{
  connection,
  autorun: true, // autoturn means worker will start processing jobs automatically
  concurrency: 5 //Cocncurrency mean how many jobs can be processed at the same time
});


// app.get('/', async (c) => {
//   try {
//     const response = await client.api.v1.user.$get();
    
//     if (!response.ok) {
//       const error = await response.text();
//       console.error('User service error:', error);
//       return c.json({ error: 'Failed to fetch user data' }, 500);
//     }

    
//     const userData = await response.json();
    
//     return c.json({
//       message: "Hello from notification service!",
//       user: userData,
//       timestamp: new Date().toISOString()
//     });
    
//   } catch (err) {
//     console.error('Request failed:', err);
//     return c.json({ error: 'Service unavailable' }, 503);
//   }
// })

serve({
  fetch: app.fetch,
  port: 3001
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`)
})

export type NotificationAppType = typeof app;