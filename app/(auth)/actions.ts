'use server';
import bcrypt from "bcryptjs";
import { eq } from 'drizzle-orm';
import { users } from '@/app/db/schema';
import { db } from '@/app/db';
import { signIn } from '@/auth';
import { fetchAppSettings, setAppSettings } from "@/app/admin/system/actions";

export async function register(username: string, password: string) {
  const resultValue = await fetchAppSettings('isRegistrationOpen');
  if (resultValue !== 'true') {
    return {
      status: 'fail',
      message: '未开放注册',
    };
  }
  try {
    const user = await db.query.users
      .findFirst({
        where: eq(users.username, username)
      })
    if (user) {
      return {
        status: 'fail',
        message: '该用户名已被注册',
      };
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.insert(users).values({
      username,
      password: hashedPassword,
    });
    
    const signInResponse = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    
    return {
      status: 'success',
    }
  } catch (error) {
    console.log(error)
    throw new Error('用户注册失败，请稍后再试');
  }
}

export async function adminSetup(username: string, password: string, adminCode: string) {
  try {
    const user = await db.query.users
      .findFirst({
        where: eq(users.username, username)
      })
    if (user) {
      return {
        status: 'fail',
        message: '该用户名已被注册',
      };
    }
    const envAdminCode = process.env.ADMIN_CODE;
    if (envAdminCode !== adminCode) {
      return {
        status: 'fail',
        message: 'Admin Code 错误',
      };
    }
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await db.insert(users).values({
      username,
      password: hashedPassword,
      isAdmin: true,
    });
    
    const signInResponse = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });
    await setAppSettings('hasSetup', 'true');
    return {
      status: 'success',
    }
  } catch (error) {
    console.log(error)
    throw new Error('用户注册失败，请稍后再试');
  }
}

