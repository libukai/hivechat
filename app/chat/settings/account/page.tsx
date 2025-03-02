'use client'
import React, { useState, useEffect } from 'react';
import { updatePassword } from '../actions';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { TranslationOutlined } from '@ant-design/icons';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';

type FormValues = {
  oldPassword: string;
  password: string;
  repeatPassword: string;
}

const AccountPage = () => {
  const t = useTranslations('Settings');
  const [currentLang, setCurrentLang] = useState('zh');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: session } = useSession();

  useEffect(() => {
    // 从 cookie 中获取语言设置
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return undefined;
    };

    // 获取浏览器语言
    const getBrowserLanguage = () => {
      const lang = navigator.language.toLowerCase();
      if (lang.startsWith('zh')) return 'zh';
      return 'en'; // 默认返回英文
    };

    // 设置当前语言
    const savedLang = getCookie('language');
    if (savedLang && ['zh', 'en'].includes(savedLang)) {
      setCurrentLang(savedLang);
    } else {
      const browserLang = getBrowserLanguage();
      setCurrentLang(browserLang);
      document.cookie = `language=${browserLang}; path=/`;
    }
  }, []);

  const handleOk = () => {
    form.submit();
  };

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
  };

  const onFinish = async (values: FormValues) => {
    setLoading(true);
    const result = await updatePassword(session?.user.username || '', values.oldPassword, values.password);
    if (result.success) {
      message.success('更新成功');
      form.resetFields();
      setIsModalOpen(false);
    } else {
      message.error(result.message)
    }
    setLoading(false);
  };

  // 添加调试信息
  console.log("Session data:", session);

  return (
    <div className='mt-6'>
      <div className='flex flex-col gap-4'>
        {/* 用户信息卡片 */}
        <div className='p-4 bg-white rounded-lg shadow-sm'>
          <h2 className='text-lg font-medium mb-4'>{t('accountInfo')}</h2>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <span className='font-medium mr-2'>{t('username')}:</span>
              <span>{session?.user?.username || '未登录'}</span>
            </div>
            <div className='flex'>
              <Button type='primary' onClick={() => setIsModalOpen(true)}>
                {t('changePassword')}
              </Button>
              <Button className='ml-2' onClick={() => signOut({ redirect: true, redirectTo: '/login' })}>
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>

        {/* 语言设置卡片 */}
        <div className='p-4 bg-white rounded-lg shadow-sm'>
          <h2 className='text-lg font-medium mb-4'>{t('language')}</h2>
          <div className='flex items-center'>
            <Select
              value={currentLang}
              style={{ width: 200 }}
              onChange={(value) => {
                setCurrentLang(value);
                document.cookie = `language=${value}; path=/`;
                window.location.reload();
              }}
              options={[
                { value: 'zh', label: '简体中文' },
                { value: 'en', label: 'English' },
              ]}
            />
          </div>
        </div>
      </div>

      <Modal
        title={t('changePassword')}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            name="oldPassword"
            label={t('oldPassword')}
            rules={[{ required: true, message: t('oldPasswordRequired') }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="password"
            label={t('newPassword')}
            rules={[
              { required: true, message: t('newPasswordRequired') },
              { min: 8, message: t('passwordLengthLimit') }
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label={t('confirmPassword')}
            dependencies={['password']}
            rules={[
              { required: true, message: t('confirmPasswordRequired') },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error(t('passwordsDoNotMatch')));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountPage;
