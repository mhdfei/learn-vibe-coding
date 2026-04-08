import { Elysia } from 'elysia';
import { db } from './db';

const app = new Elysia()
  .get('/', () => ({ message: 'Hello from Bun + Elysia!' }))
  .get('/users', async () => {
    try {
      return await db.query.users.findMany();
    } catch (error: any) {
      return { error: error.message };
    }
  })
  .listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);
