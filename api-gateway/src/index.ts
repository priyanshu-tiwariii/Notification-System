import { Hono, Context } from 'hono'

const app = new Hono()

app.get("/health",(c)=>{
  return c.json({ status: "ok" })
})

const forwardRequest = async (c: Context, targetBaseURL: string) => {
  const url = new URL(c.req.url);
  const path = url.pathname.replace(/^\/(user|notification)/, '');
  const targetUrl = `${targetBaseURL}${path}${url.search}`;
  console.log(`Forwarding request to: ${targetUrl}`);

  const body = await c.req.text(); 
  const res = await fetch(targetUrl,{
    method: c.req.method,
    headers: c.req.raw.headers,
    body: ['GET', 'HEAD'].includes(c.req.method) ? null : body,
  })

  const content = await res.text();
  console.log(`Response from ${targetUrl}:`, content);
  return new Response(content,{
    status: res.status,
    headers: res.headers
  });
}


app.use('/user/*', async (c: Context) => {
  const targetBaseURL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
  return forwardRequest(c, targetBaseURL);
});

app.use('/notification/*', async (c: Context) => {
  const targetBaseURL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3001';
  return forwardRequest(c,targetBaseURL );
});




export default ({
  fetch: app.fetch,
  port: 3000,
});
