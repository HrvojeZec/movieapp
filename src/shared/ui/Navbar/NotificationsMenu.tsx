"use client";
import Link from "next/link";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Indicator,
  Loader,
  Menu,
  ScrollArea,
  Text,
} from "@mantine/core";
import { Bell } from "lucide-react";
import { useMarkNotificationsRead } from "@/features/notifications/hooks/useMarkNotificationsRead";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import type { NotificationDto } from "@/features/notifications/types";
import { formatRelativeTime } from "@/shared/lib/format";
import classes from "./NotificationsMenu.module.scss";

const MENU_WIDTH = 340;
const LIST_MAX_HEIGHT = 380;
const BADGE = { size: 16, offset: 6 };
// Bigger counts don't fit the badge, and the exact number stops mattering
const BADGE_MAX = 9;

/** Bell with the unread count and the latest notifications; opening one marks it as read. */
export function NotificationsMenu() {
  const { notifications, unreadCount, isPending } = useNotifications();
  const { markRead, markAllRead } = useMarkNotificationsRead();

  return (
    <Menu shadow="md" width={MENU_WIDTH} position="bottom-end">
      {/* Around the button, not inside it: ActionIcon clips its overflow (see FavoritesMenu) */}
      <Indicator
        inline
        size={BADGE.size}
        offset={BADGE.offset}
        color="red"
        label={unreadCount > BADGE_MAX ? `${BADGE_MAX}+` : unreadCount}
        disabled={unreadCount === 0}
        classNames={{ indicator: classes.badge }}
      >
        <Menu.Target>
          <ActionIcon
            variant="subtle"
            size="lg"
            c="white"
            aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : "Notifications"}
          >
            <Bell size={18} />
          </ActionIcon>
        </Menu.Target>
      </Indicator>

      <Menu.Dropdown>
        <Group justify="space-between" px="sm" py={6}>
          <Text size="sm" fw={600} c="white">
            Notifications
          </Text>
          {unreadCount > 0 && (
            <Button size="compact-xs" variant="subtle" onClick={markAllRead}>
              Mark all as read
            </Button>
          )}
        </Group>
        <Menu.Divider />

        {isPending ? (
          <Box p="md" ta="center">
            <Loader size="sm" />
          </Box>
        ) : notifications.length === 0 ? (
          <Text size="sm" c="dimmed" p="md" ta="center">
            No notifications yet. Subscription updates show up here.
          </Text>
        ) : (
          <ScrollArea.Autosize mah={LIST_MAX_HEIGHT} type="auto">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={() => !notification.read && markRead([notification.id])}
              />
            ))}
          </ScrollArea.Autosize>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}

function NotificationItem({
  notification,
  onOpen,
}: {
  notification: NotificationDto;
  onOpen: () => void;
}) {
  const content = (
    <Group gap="sm" wrap="nowrap" align="flex-start">
      <span
        className={notification.read ? classes.dot : `${classes.dot} ${classes.unread}`}
        aria-hidden
      />
      <Box>
        <Text size="sm" c="white" fw={notification.read ? 400 : 600}>
          {notification.title}
        </Text>
        <Text size="xs" c="gray.4" lineClamp={2}>
          {notification.body}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {formatRelativeTime(notification.createdAt)}
        </Text>
      </Box>
    </Group>
  );

  return notification.link ? (
    <Menu.Item component={Link} href={notification.link} onClick={onOpen}>
      {content}
    </Menu.Item>
  ) : (
    <Menu.Item onClick={onOpen}>{content}</Menu.Item>
  );
}
