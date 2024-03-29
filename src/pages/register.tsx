import { register } from '@/services/user';
import { toastFail, toastSuccess } from '@/utils';
import { Button, Form, Input, NavBar } from 'antd-mobile';
import { Fragment } from 'react';
import sha1 from 'sha1';
import { history } from 'umi';

const MOCK_INVITE_CODE = '123456';

export default function () {
  return (
    <Fragment>
      <NavBar
        onBack={() => {
          history.push('/login');
        }}
      >
        用户注册
      </NavBar>
      <Form
        onFinish={async (values) => {
          if (values.inviteCode !== MOCK_INVITE_CODE) {
            toastFail('表单字段格式错误，或者邀请码无效，请检查各输入项');
            return;
          }
          const result = await register(values.username, sha1(values.password));
          if (result._id) {
            toastSuccess('注册成功！即将前往登录页面~');
            history.push('/login');
          }
        }}
        footer={
          <Button block type="submit" color="primary">
            提交
          </Button>
        }
      >
        <Form.Item name="username" label="邮箱" rules={[{ required: true }]}>
          <Input placeholder="请输入邮箱" clearable />
        </Form.Item>
        <Form.Item name="password" label="密码" rules={[{ required: true }]}>
          <Input placeholder="请输入密码" clearable type="password" />
        </Form.Item>
        <Form.Item name="inviteCode" label="邀请码" rules={[{ required: true }]}>
          <Input placeholder="本系统仅对受邀用户开放，请使用邀请码注册" clearable />
        </Form.Item>
      </Form>
    </Fragment>
  );
}
