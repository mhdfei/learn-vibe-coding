import { Elysia, t } from 'elysia';
import { usersService } from '../services/users-service';

export const usersRoute = new Elysia({ prefix: '/api/users' })
  .post('/', async ({ body, set }) => {
    try {
      const data = await usersService.register(body);
      
      set.status = 201;
      return {
        message: 'User created successfully',
        data
      };
    } catch (error: any) {
      if (error.message === 'User already exists') {
        set.status = 409;
        return {
          message: 'User already exists',
          error: 'User already exists'
        };
      }
      
      set.status = 400;
      return {
        message: 'Bad Request',
        error: error.message
      };
    }
  }, {
    body: t.Object({
      name: t.String(),
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .post('/login', async ({ body, set }) => {
    try {
      const token = await usersService.login(body);
      
      return {
        message: 'Login successful',
        data: token
      };
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        set.status = 401;
        return {
          message: 'Invalid email or password',
          error: 'Invalid credentials'
        };
      }
      
      set.status = 400;
      return {
        message: 'Bad Request',
        error: error.message
      };
    }
  }, {
    body: t.Object({
      email: t.String({ format: 'email' }),
      password: t.String()
    })
  })
  .get('/current', async ({ headers, set }) => {
    try {
      const authHeader = headers['authorization'];
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        set.status = 401;
        return { error: 'Unauthorized' };
      }

      const token = authHeader.split(' ')[1];
      const data = await usersService.getCurrentUser(token);

      return { data };
    } catch (error: any) {
      set.status = 401;
      return { error: 'Unauthorized' };
    }
  });
