import React, { useState } from 'react';
import { Picker, List, Button, NavBar } from 'antd-mobile';
import cookies from 'js-cookie';
import { ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/globalConst';
import { history } from 'umi';
import { useRequest } from 'ahooks';
import { fetchMe } from '@/services/user';
import {
  fetchAvailableOrganizations,
  fetchCurrentOrganizationWithPermission,
} from '@/services/organization';

export default function () {
  const { data: me } = useRequest(
    async () => {
      return await fetchMe();
    },
    {
      refreshDeps: [],
    },
  );

  const { data: organizationWithPermission } = useRequest(
    async () => {
      return await fetchCurrentOrganizationWithPermission();
    },
    {
      refreshDeps: [],
    },
  );

  const { data: availableOrganizations } = useRequest(
    async () => {
      return await fetchAvailableOrganizations();
    },
    {
      refreshDeps: [],
    },
  );

  const [organizationPickerVisible, setOrganizationPickerVisible] = useState<boolean>(false);
  const [value] = useState<(string | null)[]>([
    organizationWithPermission?.organization.name ?? '',
  ]);

  const doSwitchOrganization = async (name: any) => {
    cookies.set(
      ORGANIZATION_COOKIE_NAME,
      availableOrganizations?.find((item) => item.name === name[0])?._id ?? '',
      { expires: 6 },
    );
    await caches.delete('wm-runtime-v2');
    window.location.href = '/';
  };

  return (
    <div>
      <NavBar backArrow={false}>个人中心</NavBar>
      <List>
        <List.Item key={me?.username ?? ''} description={me?.username ?? 'Loading...'}>
          当前用户
        </List.Item>
        <List.Item
          description={organizationWithPermission?.organization?.name ?? 'Loading...'}
          clickable
          onClick={() => {
            setOrganizationPickerVisible(true);
          }}
        >
          当前账本
        </List.Item>
        <List.Item>
          <Button
            block
            color="danger"
            size="large"
            onClick={async () => {
              cookies.remove(TOKEN_COOKIE_NAME);
              cookies.remove(ORGANIZATION_COOKIE_NAME);
              await caches.delete('wm-runtime-v2');
              history.push('/login');
            }}
          >
            退出登录
          </Button>
        </List.Item>
      </List>
      <Picker
        columns={[availableOrganizations?.map((item) => item.name) ?? []]}
        visible={organizationPickerVisible}
        onClose={() => {
          setOrganizationPickerVisible(false);
        }}
        value={value}
        onConfirm={(name) => {
          doSwitchOrganization(name);
        }}
      />
    </div>
  );
}
