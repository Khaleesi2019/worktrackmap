import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Button } from "@/components/ui/button";
import NumericKeypad from "@/components/ui/NumericKeypad";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const { login, isLoading } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleLogin = async () => {
    if (isAdmin) {
      if (adminCode !== '1020') {
        toast({
          title: "Invalid Admin Code",
          description: "Please enter the correct admin code",
          variant: "destructive"
        });
        return;
      }
    } else {
      if (!name || !phone || phone.length !== 10 || !/^\d+$/.test(phone)) {
        toast({
          title: "Invalid Input",
          description: "Please enter your name and a valid 10-digit phone number",
          variant: "destructive"
        });
        return;
      }
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, isAdmin, adminCode })
      });

      if (!response.ok) throw new Error('Login failed');

      window.location.href = isAdmin ? '/dashboard' : '/attendance';
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };


  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = async (data) => {
    setLoginError(null);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        setLocation("/dashboard");
      } else {
        setLoginError(t("loginError"));
      }
    } catch (error) {
      setLoginError(t("loginError"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4 flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 px-3"
        >
          {language === "en" ? "ES" : "EN"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleTheme}
          className="h-8 w-8 p-0"
        >
          {theme === "light" ? (
            <i className="fas fa-moon"></i>
          ) : (
            <i className="fas fa-sun"></i>
          )}
        </Button>
      </div>

      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {t("appName")}
          </CardTitle>
          <CardDescription className="text-center">
            {t("login")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loginError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{loginError}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            
          </Form>
          <div className="flex flex-col space-y-4 w-full max-w-sm">
            <div className="flex flex-col space-y-4">
        <Input
          type="text"
          placeholder="Employee Name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-lg"
        />
        <Input
          type="tel"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={10}
          className="text-lg"
        />
        <div className="text-xs text-muted-foreground text-center">
          Enter your details to start your workday
        </div>
        
        <div className="text-xs text-center mt-4">
          <button 
            onClick={() => setIsAdmin(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            Administrative Access
          </button>
        </div>

        {isAdmin && (
          <Input
            type="password"
            placeholder="Admin Code" 
            value={adminCode}
            onChange={(e) => setAdminCode(e.target.value)}
            className="mt-2"
          />
        )}
      </div>

            <Button onClick={handleLogin}>
              {isAdmin ? 'Admin Login' : 'Start Check-in'}
            </Button>
          </div>


          <div className="mt-4 text-center text-xs text-muted-foreground">
            <p>Demo credentials: username "admin", password "admin123"</p>
          </div>
          <NumericKeypad onPinEnter={(pin) => {
            if(pin === "1020") {
              console.log("Access granted");
              // Implement access logic here
            } else {
              console.log("Access denied");
            }
          }} />
        </CardContent>
      </Card>
    </div>
  );
}