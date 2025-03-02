"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from 'next/link';
import { Form, Input, Button, Alert } from 'antd';
import mulanhua from "@/app/images/mulanhua.png";
import { useTranslations } from 'next-intl';

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginPage() {
  const t = useTranslations('Auth');
  const [form] = Form.useForm<LoginFormValues>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(values: LoginFormValues) {
    setLoading(true);
    const response = await signIn("credentials", {
      username: values.username,
      password: values.password,
      redirect: false,
    });
    setLoading(false);
    if (response?.error) {
      console.log(response?.error);
      setError(t('passwordError'));
      return;
    }
    router.push("/chat");
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center flex-row mb-6">
        <Link href="/" className='flex items-center'>
          <Image src={mulanhua} className="ml-1" alt="HiveChat logo" width={248} height={24} />
        </Link>
      </div>
      <div className="w-full max-w-md space-y-6 rounded-lg bg-white p-8 shadow-xl">
        {error && <Alert message={error} type="error" />}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark='optional'
        >
          <Form.Item
            name="username"
            label={<span className="font-medium">{t('username')}</span>}
            validateTrigger='onBlur'
            rules={[{ required: true, message: t('usernameNotice') }]}
          >
            <Input size='large' />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span className="font-medium">{t('password')}</span>}
            rules={[{ required: true, message: t('passwordNotice') }]}
          >
            <Input.Password size='large' />
          </Form.Item>
          <div className="mt-6">
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              size='large'
            >
              {t('login')}
            </Button>
          </div>
          {/* <div className='flex mt-2'>
            <Link href='/register'>
              <Button
                type='link'
                className='text-sm text-gray-400'
                style={{ 'padding': '0' }}
              >{t('register')}</Button>
            </Link>
          </div> */}
        </Form>
      </div>
    </div>
  );
}
