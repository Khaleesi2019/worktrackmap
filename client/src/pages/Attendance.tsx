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
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [jobName, setJobName] = useState('');
  const [taskName, setTaskName] = useState('');
  const [location, setLocation] = useState('');
  
  // Available tasks based on job selection
  const taskOptions = {
    'construction': ['Framing', 'Plumbing', 'Electrical', 'Roofing', 'Flooring', 'Painting'],
    'maintenance': ['Repairs', 'Inspection', 'Cleaning', 'Replacement'],
    'landscaping': ['Mowing', 'Planting', 'Pruning', 'Irrigation', 'Design'],
    'delivery': ['Pickup', 'Delivery', 'Installation', 'Assembly']
  };
  
  // Get available tasks based on selected job
  const getAvailableTasks = () => {
    return taskOptions[jobName as keyof typeof taskOptions] || [];
  };

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

  // Function to get user's current location
  const getCurrentLocation = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      } else {
        reject(new Error("Geolocation is not supported by this browser."));
      }
    });
  };
  
  // Open check-in dialog
  const openCheckInDialog = () => {
    setJobName('');
    setTaskName('');
    setLocation('');
    setShowCheckInDialog(true);
  };
  
  // Submit check-in with job, task and location data
  const submitCheckIn = async () => {
    if (!user) return;
    
    try {
      setIsCheckingIn(true);
      
      // Get current location
      let latitude = '';
      let longitude = '';
      
      try {
        const geoPosition = await getCurrentLocation();
        latitude = geoPosition.coords.latitude.toString();
        longitude = geoPosition.coords.longitude.toString();
      } catch (locationError) {
        console.error("Failed to get location:", locationError);
        toast({
          title: "Location Error",
          description: "Could not get your current location. Check-in will proceed without location data.",
          variant: "destructive",
        });
      }
      
      // First create an attendance record
      const attendanceResponse = await apiRequest("POST", "/api/attendance", {
        userId: user.id,
        checkInTime: new Date(),
        status: "present",
        notes: `Job: ${jobName}, Task: ${taskName}, Location: ${location}`
      });
      
      // Then create/update a location record
      if (latitude && longitude) {
        await apiRequest("POST", "/api/locations", {
          userId: user.id,
          latitude,
          longitude,
          locationName: location,
          status: "working"
        });
      }
      
      // Also update user's current task and job
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        jobTitle: jobName,
        task: taskName
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
      setShowCheckInDialog(false);
      
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
  
  // Original check-in function, now just opens the dialog
  const handleCheckIn = () => {
    openCheckInDialog();
  };

  const handleCheckOut = async () => {
    if (!user || !latestAttendanceRecord) return;
    
    try {
      setIsCheckingIn(true);
      
      // Update attendance record with check-out time
      await apiRequest("PATCH", `/api/attendance/${latestAttendanceRecord.id}`, {
        checkOutTime: new Date()
      });
      
      // Update user's location status to indicate they're no longer working
      try {
        const response = await apiRequest("GET", `/api/locations/user/${user.id}`);
        const userLocation = await response.json();
        
        if (userLocation && userLocation.length > 0) {
          // Update the most recent location to 'offline'
          const mostRecentLocation = userLocation[0];
          await apiRequest("PATCH", `/api/locations/${mostRecentLocation.id}`, {
            status: "offline"
          });
        }
      } catch (locationError) {
        console.error("Failed to update location on checkout:", locationError);
      }
      
      // Also clear user's current task
      await apiRequest("PATCH", `/api/users/${user.id}`, {
        task: ""
      });
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['/api/attendance'] });
      queryClient.invalidateQueries({ queryKey: ['/api/attendance/user', user.id] });
      queryClient.invalidateQueries({ queryKey: ['/api/locations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users'] });
      
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
      
      {/* Check-in Dialog */}
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('checkInTime')}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Job Selection */}
            <div className="grid gap-2">
              <label htmlFor="job-select" className="text-sm font-medium">
                {t('jobTitle')}
              </label>
              <select
                id="job-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={jobName}
                onChange={(e) => {
                  setJobName(e.target.value);
                  setTaskName(''); // Reset task when job changes
                }}
                required
              >
                <option value="" disabled>Select a job</option>
                <option value="construction">Construction</option>
                <option value="maintenance">Maintenance</option>
                <option value="landscaping">Landscaping</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            
            {/* Task Selection - Only shown if a job is selected */}
            {jobName && (
              <div className="grid gap-2">
                <label htmlFor="task-select" className="text-sm font-medium">
                  {t('currentTask')}
                </label>
                <select
                  id="task-select"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a task</option>
                  {getAvailableTasks().map((task) => (
                    <option key={task} value={task}>{task}</option>
                  ))}
                </select>
              </div>
            )}
            
            {/* Location Name */}
            <div className="grid gap-2">
              <label htmlFor="location-input" className="text-sm font-medium">
                {t('locationName')}
              </label>
              <input
                id="location-input"
                type="text"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="e.g. Main Office, Site A, Client Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
            
            <p className="text-xs text-muted-foreground">
              Your current location will be tracked for attendance purposes. You will appear on the map until you check out.
            </p>
          </div>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setShowCheckInDialog(false)}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={submitCheckIn} 
              disabled={isCheckingIn || !jobName || !taskName || !location}
            >
              {isCheckingIn ? (
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
              ) : (
                <i className="fas fa-check mr-2"></i>
              )}
              {t('save')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
