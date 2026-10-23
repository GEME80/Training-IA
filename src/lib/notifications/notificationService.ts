import { NotificationItem, NotificationCategory, NotificationSeverity } from "./types";
import { UserStorage } from "@/lib/storage/userStorage";

type NotificationListener = (notifications: NotificationItem[]) => void;

class NotificationManager {
  private listeners: Set<NotificationListener> = new Set();
  private maxItems = 15;
  private currentUid: string | null = null;

  private getStorageKey(): string {
    return "pulse_notifications_feed";
  }

  public setCurrentUid(uid?: string | null) {
    if (uid) this.currentUid = uid;
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

  /** Dispara una notificación nativa del sistema en el smartphone o escritorio */
  public triggerNativeNotification(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    try {
      if (Notification.permission === "granted") {
        new Notification(title, {
          body,
          icon: "/icon.svg",
          badge: "/icon.svg",
        });
      }
    } catch (e) {
      console.warn("[NotificationService] Error al disparar notificación nativa:", e);
    }
  }

  /** Solicita permiso de notificaciones nativas en el navegador/celular */
  public async requestPermission(): Promise<NotificationPermission | "unsupported"> {
    if (typeof window === "undefined" || !("Notification" in window)) return "unsupported";
    try {
      return await Notification.requestPermission();
    } catch {
      return "default";
    }
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

  /** Sincroniza las notificaciones de Firestore con el almacenamiento local */
  public syncWithServer(
    serverNotifs: NotificationItem[] | undefined,
    uid: string | undefined,
    userStorage: UserStorage | undefined
  ): NotificationItem[] {
    if (uid) this.currentUid = uid;
    if (!userStorage || !serverNotifs || !Array.isArray(serverNotifs)) {
      return this.getNotifications(userStorage);
    }

    const localNotifs = this.getNotifications(userStorage);
    const localMap = new Map(localNotifs.map((n) => [n.id, n]));

    const merged: NotificationItem[] = serverNotifs.map((srv) => {
      const existing = localMap.get(srv.id);
      return existing ? { ...srv, read: existing.read } : srv;
    });

    const updated = merged.slice(0, this.maxItems);
    userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    this.notify(updated);

    const newestUnread = merged.find((srv) => !srv.read && !localMap.has(srv.id));
    if (newestUnread) {
      this.triggerNativeNotification(newestUnread.title, newestUnread.message);
    }

    return updated;
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
      const updated = [newItem, ...current.filter((n) => n.id !== newItem.id)].slice(0, this.maxItems);
      userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
      this.notify(updated);
      this.triggerNativeNotification(newItem.title, newItem.message);

      if (this.currentUid) {
        fetch("/api/profile/notifications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: this.currentUid, action: "add", notification: newItem }),
        }).catch(() => {});
      }
    }

    return newItem;
  }

  public markAsRead(userStorage: UserStorage | undefined, id: string): void {
    if (!userStorage) return;
    const current = this.getNotifications(userStorage);
    const updated = current.map((n) => (n.id === id ? { ...n, read: true } : n));
    userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    this.notify(updated);

    if (this.currentUid) {
      fetch("/api/profile/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: this.currentUid, action: "markAsRead", id }),
      }).catch(() => {});
    }
  }

  public markAllAsRead(userStorage: UserStorage | undefined): void {
    if (!userStorage) return;
    const current = this.getNotifications(userStorage);
    const updated = current.map((n) => ({ ...n, read: true }));
    userStorage.setItem(this.getStorageKey(), JSON.stringify(updated));
    this.notify(updated);

    if (this.currentUid) {
      fetch("/api/profile/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: this.currentUid, action: "markAllAsRead" }),
      }).catch(() => {});
    }
  }

  public clearAll(userStorage: UserStorage | undefined): void {
    if (!userStorage) return;
    userStorage.removeItem(this.getStorageKey());
    this.notify([]);

    if (this.currentUid) {
      fetch("/api/profile/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: this.currentUid, action: "clearAll" }),
      }).catch(() => {});
    }
  }
}

export const notificationService = new NotificationManager();
