import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isConnected } = useWebSocket();

  // Fetch attendance data
  const { data: attendance, isLoading: isLoadingAttendance } = useQuery({
    queryKey: ['/api/attendance'],
  });

  // Fetch users data
  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['/api/users'],
  });

  // Calculate attendance stats
  const attendanceStats = React.useMemo(() => {
    if (!attendance || !users) {
      return {
        present: 0,
        absent: 0,
        late: 0,
        presentPercentage: 0,
        totalUsers: 0,
      };
    }

    const totalUsers = users.length;
    const presentUsers = attendance.length;
    const lateUsers = attendance.filter((record: any) => {
      const checkInTime = new Date(record.checkInTime);
      const workStartTime = new Date(checkInTime);
      workStartTime.setHours(9, 0, 0, 0); // Assuming work starts at 9:00 AM
      return checkInTime > workStartTime;
    }).length;
    const absentUsers = totalUsers - presentUsers;
    const presentPercentage = totalUsers > 0 ? (presentUsers / totalUsers) * 100 : 0;

    return {
      present: presentUsers,
      absent: absentUsers,
      late: lateUsers,
      presentPercentage,
      totalUsers,
    };
  }, [attendance, users]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-2 mb-6">
        <h1 className="text-3xl font-bold">{t('dashboard')}</h1>
        <p className="text-muted-foreground">
          {t('welcomeBack')}, {user?.name}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Connection Status Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('status')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-2xl font-bold">
                {isConnected ? t('online') : t('offline')}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Present Employees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('presentEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAttendance || isLoadingUsers ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {attendanceStats.present} / {attendanceStats.totalUsers}
              </div>
            )}
            <Progress 
              value={attendanceStats.presentPercentage} 
              className="h-2 mt-2" 
            />
          </CardContent>
        </Card>

        {/* Absent Employees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('absentEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAttendance || isLoadingUsers ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {attendanceStats.absent}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Late Employees Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t('lateEmployees')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAttendance ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">
                {attendanceStats.late}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('todaySummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingAttendance ? (
              <>
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-full mb-3" />
                <Skeleton className="h-5 w-3/4" />
              </>
            ) : attendance && attendance.length > 0 ? (
              <div className="space-y-4">
                {attendance.map((record: any) => {
                  const user = users?.find((u: any) => u.id === record.userId);
                  if (!user) return null;
                  return (
                    <div key={record.id} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {user.avatarUrl ? (
                            <img 
                              src={user.avatarUrl} 
                              alt={user.name}
                              className="w-10 h-10 rounded-full object-cover" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.role}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(record.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-xs text-muted-foreground capitalize">{record.status}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-6">
                No attendance records for today
              </p>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t('upcomingEvents')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-muted-foreground py-6">
              No upcoming events
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
