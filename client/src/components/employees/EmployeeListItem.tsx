import { User } from "@/types";
import { cn, getStatusColor } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface EmployeeListItemProps {
  user: User;
  status: string;
  isActive: boolean;
  onClick: () => void;
}

export default function EmployeeListItem({
  user,
  status,
  isActive,
  onClick
}: EmployeeListItemProps) {
  // Format status display text
  const formatStatus = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };
  
  return (
    <div 
      className={cn(
        "px-4 py-3 border-b border-border hover:bg-secondary/50 cursor-pointer",
        isActive && "bg-secondary/50"
      )}
      onClick={onClick}
    >
      <div className="flex items-center">
        <Avatar className="w-10 h-10 mr-3">
          {user.avatarUrl ? (
            <AvatarImage src={user.avatarUrl} alt={user.name} className="object-cover" />
          ) : (
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{user.name}</h4>
            <span className="text-2xl">{user.emoji || '👤'}</span>
          </div>
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">{user.role}</span>
            <div className="flex items-center">
              <div className={cn("w-2 h-2 rounded-full mr-1", getStatusColor(status))}></div>
              <span className={cn(
                "text-xs",
                status === "active" && "text-green-600 dark:text-green-400",
                status === "away" && "text-yellow-600 dark:text-yellow-400",
                status === "offline" && "text-gray-600 dark:text-gray-400"
              )}>
                {formatStatus(status)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
