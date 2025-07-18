import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import db from './config/db.js'
import userRoutes from "./controllers/user.controller.js";
import { hc } from 'hono/client'
import type { NotificationAppType } from '../../notification-service/src/index.js'
import { Queue } from 'bullmq';


import {zValidator} from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono().route('/api/v1/user', userRoutes)

export const client = hc<NotificationAppType>('http://localhost:3001/')
export const queue = new Queue('notification-queue');
db.connect();


app.get('/', (c) => {
  return c.text('Hello Hono!')
})

serve({
  fetch: app.fetch,
  port: 3002
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

export type AppType = typeof app;
