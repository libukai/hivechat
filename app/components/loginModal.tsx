'use client';

import React, { useState, useEffect } from 'react'
import { Modal, Form, Input, Button, Alert } from 'antd';
import { useLoginModal } from '@/app/contexts/loginModalContext';
import { signIn } from "next-auth/react";
import { fetchAppSettings } from '@/app/admin/system/actions';
import mulanhua from "@/app/images/mulanhua.png";
import Hivechat from "@/app/images/hivechat.svg";
import Link from 'next/link';
import Image from "next/image";
import { useTranslations } from 'next-intl';

interface LoginFormValues {
  username: string;
  password: string;
}

export default function LoginModal() {
  const t = useTranslations('Auth');
  const [form] = Form.useForm<LoginFormValues>();
  const { visible, hideLogin } = useLoginModal();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      const resultValue = await fetchAppSettings('isRegistrationOpen');
      if (resultValue !== 'true') {
        setIsRegistrationOpen(false);
      } else {
        setIsRegistrationOpen(true);
      }
    }
    fetchSettings();
  }, []);

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
    hideLogin();
  }

  return (
    <Modal
      open={visible}
      onCancel={hideLogin}
      footer={null}
      destroyOnClose
      closable={false}
      maskClosable={false}
      keyboard={false}
      width={420}
    >
      <div className="flex items-center justify-center flex-row mb-6 mt-4">
        <Image src={mulanhua} className="ml-1" alt="HiveChat logo" width={248} height={24} />
        {/* <span className="text-center text-xl">{t('login')}</span> */}
      </div>
      <div className='px-4 pb-2'>
        {error && <Alert message={error} style={{ 'marginBottom': '1rem' }} type="error" />}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark='optional'
        >
          <Form.Item
            name="username"
            label={<span className="font-medium">{t('username')}</span>}
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
          <Form.Item>
            <Button
              size='large'
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              {t('login')}
            </Button>
          </Form.Item>
          {isRegistrationOpen && <div className='flex -mt-2'>
            <Link href='/register'>
              <Button
                type='link'
                className='text-sm text-gray-400'
                style={{ 'padding': '0' }}
              >{t('register')}</Button>
            </Link>
          </div>
          }
        </Form>

      </div>
    </Modal>
  );
}
