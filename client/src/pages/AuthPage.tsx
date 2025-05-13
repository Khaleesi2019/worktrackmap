import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, { message: "Username is required" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const registrationSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  name: z.string().min(2, { message: "Name is required" }),
  jobTitle: z.string().min(2, { message: "Job title is required" }),
  task: z.string().min(2, { message: "Current task is required" }),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

export default function AuthPage() {
  const { login, isLoading } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("login");

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const registrationForm = useForm<RegistrationFormValues>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      username: "",
      password: "",
      name: "",
      jobTitle: "",
      task: "",
    },
  });

  const onLoginSubmit: SubmitHandler<LoginFormValues> = async (data) => {
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

  const onRegistrationSubmit: SubmitHandler<RegistrationFormValues> = async (data) => {
    // This would normally register a new user, but for now we'll just show a message
    alert(`Registration submitted for ${data.name} as ${data.jobTitle}. You would now be redirected to location permission.`);
  };

  const handleForgotPassword = () => {
    alert(t("forgotPasswordMessage"));
  };

  const handleNeedHelp = () => {
    alert(t("helpMessage"));
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Hero/Branding */}
      <div className="lg:w-1/2 bg-primary p-8 flex flex-col justify-center items-center text-primary-foreground">
        <div className="max-w-md text-center">
          <div className="text-6xl mb-6">
            <i className="fas fa-map-marked-alt"></i>
          </div>
          <h1 className="text-3xl font-bold mb-2">{t("appName")}</h1>
          <p className="text-xl mb-6">{t("appTagline")}</p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-foreground text-primary flex items-center justify-center mr-4">
                <i className="fas fa-map-pin"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{t("locationTracking")}</h3>
                <p className="text-sm opacity-80">{t("trackInRealTime")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-foreground text-primary flex items-center justify-center mr-4">
                <i className="fas fa-users"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{t("teamManagement")}</h3>
                <p className="text-sm opacity-80">{t("manageEmployees")}</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary-foreground text-primary flex items-center justify-center mr-4">
                <i className="fas fa-comment-dots"></i>
              </div>
              <div className="text-left">
                <h3 className="font-semibold">{t("teamChat")}</h3>
                <p className="text-sm opacity-80">{t("communicateWithTeam")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Authentication */}
      <div className="lg:w-1/2 p-8 flex justify-center items-center bg-background">
        <div className="w-full max-w-md">
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

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">{t("authTitle")}</CardTitle>
              <CardDescription className="text-center">{t("authDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="login">{t("login")}</TabsTrigger>
                  <TabsTrigger value="register">{t("register")}</TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="login">
                  {loginError && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}

                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("username")}</FormLabel>
                            <FormControl>
                              <Input placeholder="admin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("password")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="flex justify-between items-center text-sm">
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto"
                          onClick={handleForgotPassword}
                        >
                          {t("forgotPassword")}
                        </Button>
                        <Button
                          type="button"
                          variant="link"
                          className="p-0 h-auto"
                          onClick={handleNeedHelp}
                        >
                          {t("needHelp")}
                        </Button>
                      </div>

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? (
                          <i className="fas fa-circle-notch fa-spin mr-2"></i>
                        ) : null}
                        {t("loginButton")}
                      </Button>
                    </form>
                  </Form>

                  <div className="mt-4 text-center text-xs text-muted-foreground">
                    <p>{t("demoCredentials")}</p>
                  </div>
                </TabsContent>

                {/* Registration Tab */}
                <TabsContent value="register">
                  <Form {...registrationForm}>
                    <form onSubmit={registrationForm.handleSubmit(onRegistrationSubmit)} className="space-y-4">
                      <FormField
                        control={registrationForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("username")}</FormLabel>
                            <FormControl>
                              <Input placeholder="johndoe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("password")}</FormLabel>
                            <FormControl>
                              <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("fullName")}</FormLabel>
                            <FormControl>
                              <Input placeholder="John Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="jobTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("jobTitle")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Field Technician" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registrationForm.control}
                        name="task"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t("currentTask")}</FormLabel>
                            <FormControl>
                              <Input placeholder="Site inspection" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        {t("registerButton")}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button 
                variant="link" 
                onClick={() => setLocation("/")}
                className="text-muted-foreground"
              >
                <i className="fas fa-arrow-left mr-2"></i> {t("backToWelcome")}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}