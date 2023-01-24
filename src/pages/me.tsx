import { ORGANIZATION_COOKIE_NAME, TOKEN_COOKIE_NAME } from '@/globalConst';
import {
  fetchAvailableOrganizations,
  fetchCurrentOrganizationWithPermission,
} from '@/services/organization';
import { fetchMe } from '@/services/user';
import { useRequest } from 'ahooks';
import { Button, List, NavBar, Picker } from 'antd-mobile';
import cookies from 'js-cookie';
import { useState } from 'react';
import { history } from 'umi';

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

  const doSwitchOrganization: (organizationName: string) => Promise<void> = async (
    organizationName,
  ) => {
    cookies.set(
      ORGANIZATION_COOKIE_NAME,
      availableOrganizations?.find((item) => item.name === organizationName)?._id ?? '',
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
        <List.Item
          clickable
          onClick={() => {
            history.push('/health-check');
          }}
        >
          系统健康检查
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
        onConfirm={(pickedNames) => {
          if (!pickedNames || !pickedNames[0]) {
            return;
          }
          doSwitchOrganization(pickedNames[0].toString());
        }}
      />
    </div>
  );
}
