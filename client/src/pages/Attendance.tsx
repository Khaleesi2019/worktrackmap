import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { formatDate, formatTime } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Attendance as AttendanceType, User } from "@/types";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Attendance() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
  });

  // Fetch attendance records
  const { data: attendanceRecords, isLoading: isLoadingAttendance } = useQuery<AttendanceType[]>({
    queryKey: ['/api/attendance'],
  });

  // Fetch user's attendance records
  const { data: userAttendance } = useQuery<AttendanceType[]>({
    queryKey: ['/api/attendance/user', user?.id],
    enabled: !!user,
  });

  // Check if user has already checked in today
  const hasCheckedInToday = userAttendance?.some(record => {
    const recordDate = new Date(record.checkInTime);
    const today = new Date();
    return (
      recordDate.getDate() === today.getDate() &&
      recordDate.getMonth() === today.getMonth() &&
      recordDate.getFullYear() === today.getFullYear()
    );
  });

  // Latest attendance record for the current user
  const latestAttendanceRecord = userAttendance?.sort((a, b) => 
    new Date(b.checkInTime).getTime() - new Date(a.checkInTime).getTime()
  )[0];

  const handleCheckIn = async () => {
    if (!user) return;
    
    try {
      setIsCheckingIn(true);
      
      await apiRequest("POST", "/api/attendance", {
        userId: user.id,
        checkInTime: new Date(),
        status: "present"
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/user', user.id] });
      
      toast({
        title: "Check-in Successful",
        description: `You've checked in at ${formatTime(new Date())}`,
      });
    } catch (error) {
      console.error("Failed to check in:", error);
      toast({
        title: "Check-in Failed",
        description: "An error occurred when checking in. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    if (!user || !latestAttendanceRecord) return;
    
    try {
      setIsCheckingIn(true);
      
      await apiRequest("PATCH", `/api/attendance/${latestAttendanceRecord.id}`, {
        checkOutTime: new Date()
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/user', user.id] });
      
      toast({
        title: "Check-out Successful",
        description: `You've checked out at ${formatTime(new Date())}`,
      });
    } catch (error) {
      console.error("Failed to check out:", error);
      toast({
        title: "Check-out Failed",
        description: "An error occurred when checking out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Map user IDs to names
  const getUserName = (userId: number): string => {
    const foundUser = users?.find(u => u.id === userId);
    return foundUser ? foundUser.name : `User #${userId}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2 md:space-y-0 mb-6">
        <div>
          <h1 className="text-3xl font-bold">{t('attendance')}</h1>
          <p className="text-muted-foreground">{formatDate(selectedDate)}</p>
        </div>
        
        <div className="flex space-x-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <i className="fas fa-calendar-alt mr-2"></i>
                {t('filter')}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t('filter')}</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                {/* Calendar component would go here */}
                <p className="text-center text-muted-foreground">
                  Date selection functionality to be implemented
                </p>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={hasCheckedInToday && latestAttendanceRecord && !latestAttendanceRecord.checkOutTime ? handleCheckOut : handleCheckIn}
            disabled={isCheckingIn}
          >
            {isCheckingIn ? (
              <i className="fas fa-circle-notch fa-spin mr-2"></i>
            ) : hasCheckedInToday && latestAttendanceRecord && !latestAttendanceRecord.checkOutTime ? (
              <i className="fas fa-sign-out-alt mr-2"></i>
            ) : (
              <i className="fas fa-sign-in-alt mr-2"></i>
            )}
            {hasCheckedInToday && latestAttendanceRecord && !latestAttendanceRecord.checkOutTime ? 'Check Out' : 'Check In'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="team" className="mb-6">
        <TabsList>
          <TabsTrigger value="team">{t('teamMembers')}</TabsTrigger>
          <TabsTrigger value="my">{t('profile')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>{t('teamMembers')}</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingUsers || isLoadingAttendance ? (
                <p className="text-center py-4 text-muted-foreground">
                  {t('loading')}
                </p>
              ) : attendanceRecords && attendanceRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Employee</th>
                        <th className="text-left py-3 px-2 font-medium">Check In</th>
                        <th className="text-left py-3 px-2 font-medium">Check Out</th>
                        <th className="text-left py-3 px-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceRecords.map(record => (
                        <tr key={record.id} className="border-b">
                          <td className="py-3 px-2">{getUserName(record.userId)}</td>
                          <td className="py-3 px-2">{formatTime(record.checkInTime)}</td>
                          <td className="py-3 px-2">
                            {record.checkOutTime ? formatTime(record.checkOutTime) : '-'}
                          </td>
                          <td className="py-3 px-2 capitalize">{record.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No attendance records for today.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="my">
          <Card>
            <CardHeader>
              <CardTitle>{t('profile')}</CardTitle>
            </CardHeader>
            <CardContent>
              {userAttendance && userAttendance.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-2 font-medium">Date</th>
                        <th className="text-left py-3 px-2 font-medium">Check In</th>
                        <th className="text-left py-3 px-2 font-medium">Check Out</th>
                        <th className="text-left py-3 px-2 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userAttendance.map(record => (
                        <tr key={record.id} className="border-b">
                          <td className="py-3 px-2">{formatDate(record.checkInTime)}</td>
                          <td className="py-3 px-2">{formatTime(record.checkInTime)}</td>
                          <td className="py-3 px-2">
                            {record.checkOutTime ? formatTime(record.checkOutTime) : '-'}
                          </td>
                          <td className="py-3 px-2 capitalize">{record.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  No attendance records found.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
