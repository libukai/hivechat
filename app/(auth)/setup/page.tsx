"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from 'next/link';
import { adminSetup } from '../actions';
import { fetchAppSettings } from '@/app/admin/system/actions';
import { Form, Input, Button, Alert } from 'antd';
import mulanhua from "@/app/images/mulanhua.png";
import { useTranslations } from 'next-intl';

interface SetupFormValues {
  username: string;
  password: string;
  repeatPassword: string;
  adminCode: string;
}

export default function SetupPage() {
  const t = useTranslations('Auth');
  const [form] = Form.useForm<SetupFormValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSetup, setHasSetup] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      const resultValue = await fetchAppSettings('hasSetup');
      if (resultValue === 'true') {
        setHasSetup(true);
        window.location.href = "/chat";
      } else {
        setHasSetup(false);
      }
    }
    fetchSettings();
  }, []);

  async function handleSubmit(values: SetupFormValues) {
    setLoading(true);
    if (values.password.length < 8 || values.repeatPassword.length < 8) {
      setError(t('passwordLengthLimit'));
      setLoading(false);
      return;
    }
    if (values.password !== values.repeatPassword) {
      setError(t('passwordNotSame'));
      setLoading(false);
      return;
    }
    try {
      const result = await adminSetup(values.username, values.password, values.adminCode);
      if (result.status === 'success') {
        window.location.href = "/chat";
      } else {
        setError(result.message || t('registerFail'));
        setLoading(false);
      }
    } catch (err: any) {
      setError(err.message || t('registerFail'));
      setLoading(false);
    }
  }

  if (hasSetup) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center flex-row my-6">
        <Link href="/" className='flex items-center'>
          <Image src={mulanhua} className="ml-1" alt="HiveChat logo" width={248} height={24} />
        </Link>
      </div>
      <div className="w-full max-w-sm space-y-6 rounded-lg bg-white p-6 mb-6 shadow-xl">
        <h2 className="text-center text-2xl">{t('setupAdminAccount')}</h2>
        {error && <Alert message={error} type="error" />}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark='optional'
        >
          <div className="text-sm text-gray-400 my-2">{t('setupNotice')}</div>
          <Form.Item
            name="username"
            label={<span className="font-medium">{t('username')}</span>}
            rules={[{ required: true, message: t('usernameNotice') }]}
          >
            <Input size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label={<span className="font-medium">{t('password')}</span>}
            rules={[{ required: true, message: t('passwordNotice') }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <Form.Item
            name="repeatPassword"
            label={<span className="font-medium">{t('repeatPassword')}</span>}
            rules={[{ required: true, message: t('passwordNotice') }]}
          >
            <Input.Password size="large" />
          </Form.Item>

          <Form.Item
            name="adminCode"
            label={<span className="font-medium">Admin Code</span>}
            rules={[{ required: true, message: t('adminCodeRequired') }]}
          >
            <Input.Password size="large" />
          </Form.Item>
          <div className="text-sm text-gray-400 -mt-2 mb-2">{t('adminCodeNotice')}</div>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              loading={loading}
            >
              {t('setupAdminAccount')}
            </Button>
          </Form.Item>
        </Form>
      </div>
    </div>
  );
}
