
import { Bell } from "lucide-react";
import { useState } from "react";

export function Notifications() {
  const [notifications, setNotifications] = useState([]);
  
  return (
    <div className="relative">
      <Bell className="h-6 w-6 cursor-pointer" />
      {notifications.length > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
          {notifications.length}
        </span>
      )}
    </div>
  );
}
