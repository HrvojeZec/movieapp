import { notifications } from "@mantine/notifications";

// One color per kind of message, so every toast of a kind looks the same
const COLORS = { success: "green", error: "red", info: "blue" } as const;

export const notifySuccess = (title: string, message: string) =>
  notifications.show({ title, message, color: COLORS.success });

export const notifyError = (title: string, message: string) =>
  notifications.show({ title, message, color: COLORS.error });

export const notifyInfo = (title: string, message: string) =>
  notifications.show({ title, message, color: COLORS.info });
