"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { notificationService } from "@/lib/notifications/notificationService";
import { NotificationItem } from "@/lib/notifications/types";
import { UserStorage } from "@/lib/storage/userStorage";
import { NotificationCenterDrawer } from "./NotificationCenterDrawer";

interface NotificationBellButtonProps {
  userStorage?: UserStorage;
  uid?: string;
}

export const NotificationBellButton: React.FC<NotificationBellButtonProps> = ({ userStorage, uid }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (uid) {
      notificationService.setCurrentUid(uid);
    }
    if (userStorage) {
      setNotifications(notificationService.getNotifications(userStorage));
    }

    const unsubscribe = notificationService.subscribe((items) => {
      setNotifications(items);
    });

    return () => {
      unsubscribe();
    };
  }, [userStorage]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        aria-label="Centro de notificaciones"
        title="Centro de notificaciones y sincronizaciones"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationCenterDrawer
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          notifications={notifications}
          userStorage={userStorage}
        />
      )}
    </>
  );
};
