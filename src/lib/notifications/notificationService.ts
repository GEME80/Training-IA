import { NotificationItem, NotificationCategory, NotificationSeverity } from "./types";
import { UserStorage } from "@/lib/storage/userStorage";

type NotificationListener = (notifications: NotificationItem[]) => void;

class NotificationManager {
  private listeners: Set<NotificationListener> = new Set();
  private maxItems = 25;

  private getStorageKey(): string {
    return "pulse_notifications_feed";
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(items: NotificationItem[]) {
    this.listeners.forEach((listener) => {
      try {
        listener(items);
      } catch (err) {
        console.warn("[NotificationService] Error en listener:", err);
      }
    });
  }

  public getNotifications(userStorage?: UserStorage): NotificationItem[] {
    if (!userStorage) return [];
    try {
      const raw = userStorage.getItem(this.getStorageKey());
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  public addNotification(
    userStorage: UserStorage | undefined,
    item: {
      title: string;
      message: string;
      details?: string;
      category: NotificationCategory;
      severity?: NotificationSeverity;
      metadata?: Record<string, unknown>;
    }
  ): NotificationItem {
    const newItem: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: item.title,
      message: item.message,
      details: item.details,
      category: item.category,
      severity: item.severity || "info",
      timestamp: new Date().toISOString(),
      read: false,
      metadata: item.metadata,
    };

    if (userStorage) {
      const current = this.getNotifications(userStorage);
      const updated = [newItem, ...current].slice(0, this.maxItems);
      userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
      this.notify(updated);
    }

    return newItem;
  }

  public markAsRead(userStorage: UserStorage | undefined, id: string): void {
    if (!userStorage) return;
    const current = this.getNotifications(userStorage);
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    this.notify(updated);
  }

  public markAllAsRead(userStorage: UserStorage | undefined): void {
    if (!userStorage) return;
    const current = this.getNotifications(userStorage);
    const updated = current.map((n) => ({ ...n, read: true }));
    userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    this.notify(updated);
  }

  public clearAll(userStorage: UserStorage | undefined): void {
    if (!userStorage) return;
    userStorage.removeItem(this.getStorageKey());
    this.notify([]);
  }
}

export const notificationService = new NotificationManager();
