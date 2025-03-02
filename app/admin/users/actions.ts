'use server';
import { users } from '@/app/db/schema';
import { db } from '@/app/db';
import { desc, eq } from 'drizzle-orm';
import { auth } from "@/auth";
import bcrypt from "bcryptjs";

export async function getUserList() {
  const session = await auth();
  if (!session?.user.isAdmin) {
    throw new Error('not allowed');
  }
  try {
    const userList = await db.query.users.findMany({
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    });
    return userList.map(user => ({
      id: user.id,
      username: user.username,
      isAdmin: user.isAdmin || false,
      createdAt: user.createdAt?.toISOString() || '',
    }));
  } catch (error) {
    return [];
  }
}

export async function addUser(userBasicInfo: { username: string, password: string, isAdmin: boolean }) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    throw new Error('not allowed');
  }
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, userBasicInfo.username),
    });

    if (existingUser) {
      return {
        success: false,
        message: '用户名已被注册',
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userBasicInfo.password, salt);

    const result = await db.insert(users).values({
      username: userBasicInfo.username,
      password: hashedPassword,
      isAdmin: userBasicInfo.isAdmin,
    });
    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      message: 'database delete error'
    }
  }
}

export async function deleteUser(username: string) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    throw new Error('not allowed');
  }
  try {
    await db.delete(users).where(eq(users.username, username));
    return {
      success: true,
      message: '删除成功'
    }
  } catch (error) {
    return {
      success: false,
      message: 'database delete error'
    }
  }
}

export async function updateUser(username: string, userBasicInfo: { username: string, password?: string, isAdmin: boolean }) {
  const session = await auth();
  if (!session?.user.isAdmin) {
    throw new Error('not allowed');
  }
  try {
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, username),
    });

    if (!existingUser) {
      return {
        success: false,
        message: '该用户不存在',
      };
    }
    let updateResult = null;
    if (userBasicInfo.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userBasicInfo.password, salt);
      updateResult = await db.update(users)
        .set({
          username: userBasicInfo.username,
          password: hashedPassword,
          isAdmin: userBasicInfo.isAdmin,
        })
        .where(eq(users.username, username));
    } else {
      updateResult = await db.update(users)
        .set({
          username: userBasicInfo.username,
          isAdmin: userBasicInfo.isAdmin,
        })
        .where(eq(users.username, username));
    }
    return {
      success: true,
      message: '用户信息已更新',
    };
  } catch (error) {
    return {
      success: false,
      message: 'database delete error'
    }
  }
}
