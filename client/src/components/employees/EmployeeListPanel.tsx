import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { User, Location } from "@/types";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EmployeeListItem from "./EmployeeListItem";
import { Skeleton } from "@/components/ui/skeleton";

interface EmployeeListPanelProps {
  users: User[];
  locations: Location[];
  activeEmployeeId: number | null;
  onEmployeeClick: (id: number) => void;
  isLoading: boolean;
  className?: string;
}

export default function EmployeeListPanel({
  users,
  locations,
  activeEmployeeId,
  onEmployeeClick,
  isLoading,
  className
}: EmployeeListPanelProps) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "online" | "offline">("all");
  
  // Get employee status from locations
  const getEmployeeStatus = (userId: number): string => {
    const location = locations.find(loc => loc.userId === userId);
    return location?.status || "offline";
  };
  
  // Filter employees based on search query and status filter
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        user.role.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const status = getEmployeeStatus(user.id);
    const matchesStatus = filterStatus === "all" ||
                        (filterStatus === "online" && (status === "active" || status === "away")) ||
                        (filterStatus === "offline" && status === "offline");
    
    return matchesSearch && matchesStatus;
  });
  
  // Calculate online users count
  const onlineUsersCount = users.filter(user => {
    const status = getEmployeeStatus(user.id);
    return status === "active" || status === "away";
  }).length;

  return (
    <div id="employee-panel" className={cn(
      "w-80 bg-background border-l border-border overflow-y-auto",
      className
    )}>
      <div className="p-4 border-b border-border flex justify-between items-center">
        <h2 className="font-medium text-lg">{t("teamMembers")}</h2>
        <div className="text-sm text-muted-foreground">
          <span className="text-green-500 font-medium">{onlineUsersCount}</span> / <span>{users.length}</span> <span>{t("online")}</span>
        </div>
      </div>
      
      <div className="p-3">
        <div className="relative">
          <Input 
            type="text" 
            placeholder={t("searchTeam")} 
            className="w-full py-2 pl-9 pr-4 rounded-lg" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <i className="fas fa-search absolute left-3 top-3 text-muted-foreground"></i>
        </div>
      </div>
      
      {/* Filter options */}
      <div className="px-3 pb-2 flex space-x-2 text-sm">
        <Button 
          variant={filterStatus === "all" ? "default" : "outline"} 
          size="sm"
          className="py-1 px-3 h-auto rounded-full"
          onClick={() => setFilterStatus("all")}
        >
          <span>{t("all")}</span>
        </Button>
        <Button 
          variant={filterStatus === "online" ? "default" : "outline"} 
          size="sm"
          className="py-1 px-3 h-auto rounded-full"
          onClick={() => setFilterStatus("online")}
        >
          <span>{t("online")}</span>
        </Button>
        <Button 
          variant={filterStatus === "offline" ? "default" : "outline"} 
          size="sm"
          className="py-1 px-3 h-auto rounded-full"
          onClick={() => setFilterStatus("offline")}
        >
          <span>{t("offline")}</span>
        </Button>
      </div>
      
      {/* Team members list */}
      <div className="overflow-y-auto max-h-[calc(100vh-240px)]">
        {isLoading ? (
          <>
            <div className="px-4 py-3 border-b border-border">
              <Skeleton className="h-10 w-10 rounded-full mr-3 float-left" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-20" />
              <div className="clear-both"></div>
            </div>
            <div className="px-4 py-3 border-b border-border">
              <Skeleton className="h-10 w-10 rounded-full mr-3 float-left" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-20" />
              <div className="clear-both"></div>
            </div>
            <div className="px-4 py-3 border-b border-border">
              <Skeleton className="h-10 w-10 rounded-full mr-3 float-left" />
              <Skeleton className="h-5 w-40 mb-2" />
              <Skeleton className="h-4 w-20" />
              <div className="clear-both"></div>
            </div>
          </>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map(user => {
            const location = locations.find(loc => loc.userId === user.id);
            const isActive = user.id === activeEmployeeId;
            
            return (
              <EmployeeListItem 
                key={user.id}
                user={user}
                status={location?.status || "offline"}
                isActive={isActive}
                onClick={() => onEmployeeClick(user.id)}
              />
            );
          })
        ) : (
          <div className="px-4 py-8 text-center text-muted-foreground">
            No employees match your search
          </div>
        )}
      </div>
    </div>
  );
}
