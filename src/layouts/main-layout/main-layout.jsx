import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Avatar,
  BreadcrumbItem,
  Breadcrumbs,
  Button,
  Image,
  ScrollShadow,
  Spacer,
  ToastProvider,
  Tooltip,
  cn,
  useDisclosure,
} from '@heroui/react';
import { Icon } from '@iconify/react';
import { useMediaQuery } from 'usehooks-ts';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import SidebarDrawer from './sidebar-drawer';
import Sidebar from './sidebar';
import { items } from './sidebar-items';
import { clearAuthSession, getAuthUsername } from '@/service/auth-storage.js';

function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [title, setTitle] = useState('Products');
  const [selectedMenu, setSelectedMenu] = useState('products');
  const userName = useMemo(() => getAuthUsername() || 'User', []);

  const onToggle = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  useEffect(() => {
    if (location.pathname === '/') {
      setTitle('Products');
      setSelectedMenu('products');
      return;
    }

    setTitle('Dashboard');
    setSelectedMenu('dashboard');
  }, [location.pathname]);

  const handleLogout = useCallback(() => {
    clearAuthSession();
    navigate('/login', { replace: true });
  }, [navigate]);

  const breadcrumbItems = [
    { key: 'dashboard', title: 'Dashboard', link: '/' },
    { key: 'products', title: title, link: '/' },
  ];

  const showBreadcrumbs = breadcrumbItems.length > 1;

  const handleBreadcrumbClick = (link) => {
    navigate(link);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <SidebarDrawer
        className={cn('overflow-hidden', { 'min-w-[76px]': isCollapsed })}
        hideCloseButton
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <div
          className={cn(
            'border-r-small! border-divider bg-linear-to-t from-primary-100 to-white transition-width relative flex h-full flex-col p-6',
            {
              'w-[83px] items-center px-1.5 py-6': isCollapsed,
            },
          )}
        >
          <div className={cn('flex items-center gap-3 px-3', { 'justify-center gap-0': isCollapsed })}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full">
              <Image src="/favicon.svg" fallbackSrc="/favicon.svg" />
            </div>
            <div
              className={cn('flex flex-col gap-0.5 text-small font-bold opacity-100', {
                'w-0 opacity-0': isCollapsed,
              })}
            >
              <span className="uppercase text-primary">App Toko</span>
              <span className="text-xs font-normal text-primary-500">Product Service</span>
            </div>
            <div className={cn('flex-end flex', { hidden: isCollapsed })}>
              <Icon
                className="dark:text-primary-foreground/60 cursor-pointer [&>g]:stroke-[1px]"
                icon="solar:round-alt-arrow-left-line-duotone"
                width={24}
                onClick={isMobile ? onOpenChange : onToggle}
              />
            </div>
          </div>

          <ScrollShadow className="-mr-6 h-full max-h-full py-6 pr-6">
            <Sidebar
              key={selectedMenu}
              defaultSelectedKey={selectedMenu}
              isCompact={isCollapsed}
              items={items}
              iconClassName="group-data-[selected=true]:text-primary-600"
              itemClasses={{
                base: 'px-3 rounded-large data-[selected=true]:bg-primary-200!',
                title: 'group-data-[selected=true]:text-primary-600',
              }}
              onSelect={(key) => {
                const flatItems = items.flatMap((item) => (item.items?.length ? item.items : [item]));
                const selected = flatItems.find((item) => item.key === key);
                if (selected?.href) {
                  navigate(selected.href);
                }
              }}
            />
          </ScrollShadow>

          <Spacer y={2} />

          <div className={cn('mt-auto flex flex-col', { 'items-center': isCollapsed })}>
            {isCollapsed ? (
              <Button
                isIconOnly
                className="text-default-600 flex h-10 w-10"
                size="sm"
                variant="light"
              >
                <Icon
                  className="dark:text-primary-foreground/60 cursor-pointer [&>g]:stroke-[1px]"
                  height={24}
                  icon="solar:round-alt-arrow-right-line-duotone"
                  width={24}
                  onClick={onToggle}
                />
              </Button>
            ) : null}
            <Tooltip content="Log Out" isDisabled={!isCollapsed} placement="right">
              <Button
                className={cn(
                  'text-default-500 data-[hover=true]:text-foreground justify-start',
                  {
                    'justify-center': isCollapsed,
                  },
                )}
                isIconOnly={isCollapsed}
                startContent={isCollapsed ? null : (
                  <Icon
                    className="text-default-500 flex-none rotate-180"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                )}
                variant="light"
                onPress={handleLogout}
              >
                {isCollapsed ? (
                  <Icon
                    className="text-default-500 rotate-180"
                    icon="solar:minus-circle-line-duotone"
                    width={24}
                  />
                ) : (
                  'Log Out'
                )}
              </Button>
            </Tooltip>
          </div>
        </div>
      </SidebarDrawer>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-t from-primary-100 to-white p-4 md:p-10">
        <header className="rounded-medium bg-content1 shadow-small border-small border-primary/10 flex items-center justify-between gap-3 p-4">
          <Button
            isIconOnly
            className="sm:hidden"
            size="sm"
            variant="flat"
            onPress={() => {
              setIsCollapsed(false);
              onOpen();
            }}
          >
            <Icon
              className="text-default-500"
              icon="solar:sidebar-minimalistic-linear"
              width={20}
            />
          </Button>
          <div className="flex flex-col gap-1">
            <h2 className="text-medium text-left font-medium text-default-700">{title}</h2>

            {showBreadcrumbs ? (
              <Breadcrumbs
                size="sm"
                className="text-xs"
                separator="/"
              >
                {breadcrumbItems.map((item, index) => {
                  const isLast = index === breadcrumbItems.length - 1;

                  return (
                    <BreadcrumbItem
                      key={item.key}
                      isCurrent={isLast}
                      classNames={{
                        item: isLast
                          ? 'text-primary-600 font-medium'
                          : 'text-default-500 cursor-pointer hover:text-primary-500 transition-colors',
                      }}
                      onPress={!isLast ? () => handleBreadcrumbClick(item.link) : undefined}
                    >
                      {item.title}
                    </BreadcrumbItem>
                  );
                })}
              </Breadcrumbs>
            ) : null}
          </div>

          <div className="flex items-center gap-3 px-3">
            <Tooltip
              content={(
                <div className="mt-2 px-1 py-2">
                  <p className="text-small font-medium text-foreground">{userName}</p>
                  <p className="text-tiny font-medium text-default-400">{`${userName.toLowerCase()}@example.com`}</p>
                </div>
              )}
            >
              <Avatar
                isBordered
                className="ring-primary-400 ring-offset-2"
                size="sm"
                src={`https://ui-avatars.com/api/?background=107EA3&color=FFFFFF&name=${encodeURIComponent(userName)}`}
              />
            </Tooltip>
          </div>
        </header>
        <main className="mt-4 flex min-h-0 w-full flex-1 overflow-hidden rounded-medium bg-content1 shadow-small">
          <div className="rounded-medium flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden p-4">
            <Outlet />
            <ToastProvider placement="top-center" />
          </div>
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
