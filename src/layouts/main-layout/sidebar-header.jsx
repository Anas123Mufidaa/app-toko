import React from 'react';
import { Button, cn } from '@heroui/react';
import { Icon } from '@iconify/react';

const SidebarHeader = React.forwardRef(({ page, paginate, onOpen, className, ...props }, ref) => {
  return (
    <header
      className={cn('flex w-full items-center justify-between rounded-full border border-default-200 bg-default-100 px-3 py-2 sm:px-6', className)}
      {...props}
      ref={ref}
    >
      {page === 0 ? (
        <Button
          isIconOnly
          className={cn('text-default-100 flex', {
            'sm:hidden': page === 0,
          })}
          size="sm"
          variant="light"
          onPress={onOpen}
        >
          <Icon height={24} icon="solar:hamburger-menu-outline" width={24} />
        </Button>
      ) : (
        <Button
          isIconOnly
          className="text-default-100 flex lg:hidden"
          size="sm"
          variant="light"
          onPress={() => paginate?.(-1)}
        >
          <Icon height={24} icon="solar:arrow-left-outline" width={24} />
        </Button>
      )}
    </header>
  );
});

SidebarHeader.displayName = 'SidebarHeader';

export default SidebarHeader;
