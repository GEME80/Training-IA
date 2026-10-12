export type NotificationCategory = "SYNC" | "COACH" | "ZONES" | "SEASON" | "ALERT";
export type NotificationSeverity = "success" | "info" | "warning" | "error";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  details?: string;
  category: NotificationCategory;
  severity: NotificationSeverity;
  timestamp: string; // ISO String
  read: boolean;
  metadata?: Record<string, unknown>;
}
