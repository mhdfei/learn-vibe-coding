import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import * as bcrypt from 'bcryptjs';

export class UsersService {
  async register(payload: any) {
    const { name, email, password } = payload;

    // 1. Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    // 2. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Save user to database
    const [result] = await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Retrieve created user (id is usually in result.insertId for MySQL, but drizzle returns it differently)
    // For MySQL with drizzle, insert usually returns [ { insertId: number } ]
    const insertedId = (result as any).insertId;
    
    const newUser = await db.query.users.findFirst({
      where: eq(users.id, insertedId),
    });

    if (!newUser) {
      throw new Error('Failed to create user');
    }

    const { password: _, ...userData } = newUser;
    return userData;
  }
}

export const usersService = new UsersService();
