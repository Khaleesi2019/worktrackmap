import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
const enTranslations = {
  // General
  appName: "UbiTrack",
  loading: "Loading...",
  continue: "Continue",
  welcomeDescription: "Track your team's location and attendance in real-time",
  trackInRealTime: "Track in real-time",
  manageEmployees: "Manage your workforce",
  communicateWithTeam: "Chat with your team",
  teamManagement: "Team Management",
  appTagline: "Real-time location tracking for your team",
  selectLanguage: "Select your language",
  selectTheme: "Choose theme",
  lightMode: "Light Mode",
  darkMode: "Dark Mode",
  all: "All",
  
  // Authentication
  authTitle: "Welcome to UbiTrack",
  authDescription: "Please sign in to continue or create a new account",
  login: "Login",
  register: "Register",
  logout: "Logout",
  username: "Username",
  password: "Password",
  fullName: "Full Name",
  jobTitle: "Job Title",
  currentTask: "Current Task",
  emoji: "Avatar Emoji",
  loginButton: "Sign In",
  registerButton: "Create Account",
  loginError: "Invalid username or password",
  registrationError: "Registration failed. Try a different username.",
  forgotPassword: "Forgot password?",
  needHelp: "Need help?",
  forgotPasswordMessage: "Please contact your administrator to reset your password.",
  helpMessage: "For assistance, please contact support at support@ubitrack.com",
  demoCredentials: "Demo credentials: username \"admin\", password \"admin123\"",
  backToWelcome: "Back to welcome page",
  
  // Navigation
  dashboard: "Dashboard",
  employees: "Employees",
  locationTracking: "Location Tracking",
  attendance: "Attendance",
  teamChat: "Team Chat",
  chat: "Chat",
  reports: "Reports",
  settings: "Settings",
  details: "Details",
  location: "Location",
  locationDetails: "Location Details",
  latitude: "Latitude",
  longitude: "Longitude",
  locationName: "Location Name",
  detailedMapView: "Detailed map view coming soon",
  
  // Common actions
  save: "Save",
  cancel: "Cancel",
  add: "Add",
  edit: "Edit",
  delete: "Delete",
  search: "Search",
  filter: "Filter",
  
  // Dashboard
  welcomeBack: "Welcome back",
  todaySummary: "Today's Summary",
  presentEmployees: "Present",
  absentEmployees: "Absent",
  lateEmployees: "Late",
  upcomingEvents: "Upcoming Events",
  
  // Settings
  notifications: "Notifications",
  profile: "Profile",
  
  // Location tracking
  locationDescription: "Monitor employee locations in real-time",
  lastUpdated: "Last updated",
  allEmployees: "All Employees",
  onlineEmployees: "Online",
  offlineEmployees: "Offline",
  awayEmployees: "Away",
  
  // Employee details
  checkInTime: "Check-in Time",
  currentLocation: "Current Location",
  status: "Status",
  lastUpdate: "Last Update",
  message: "Message",
  call: "Call",
  
  // Team chat
  typeMessage: "Type a message...",
  sendMessage: "Send",
  onlineUsers: "online",
  
  // Search
  searchEmployees: "Search employees...",
  searchTeam: "Search team members...",
  
  // Status indicators
  active: "Active",
  away: "Away",
  offline: "Offline",
  online: "Online",
  working: "Working",
  
  // Time indicators
  today: "Today",
  yesterday: "Yesterday",
  now: "Now",
  minutesAgo: "min ago",
  hoursAgo: "hr ago",
  
  // Team members
  teamMembers: "Team Members"
};

// Spanish translations
const esTranslations = {
  // General
  appName: "UbiTrack",
  loading: "Cargando...",
  continue: "Continuar",
  welcomeDescription: "Rastrea la ubicación y asistencia de tu equipo en tiempo real",
  trackInRealTime: "Seguimiento en tiempo real",
  manageEmployees: "Gestiona tu equipo",
  communicateWithTeam: "Comunícate con tu equipo",
  teamManagement: "Gestión de Equipo",
  appTagline: "Seguimiento de ubicación en tiempo real para tu equipo",
  selectLanguage: "Selecciona tu idioma",
  selectTheme: "Elige el tema",
  lightMode: "Modo Claro",
  darkMode: "Modo Oscuro",
  all: "Todos",
  
  // Authentication
  authTitle: "Bienvenido a UbiTrack",
  authDescription: "Inicia sesión para continuar o crea una nueva cuenta",
  login: "Iniciar sesión",
  register: "Registrarse",
  logout: "Cerrar sesión",
  username: "Nombre de usuario",
  password: "Contraseña",
  fullName: "Nombre completo",
  jobTitle: "Puesto de trabajo",
  currentTask: "Tarea actual",
  emoji: "Emoji de Avatar",
  loginButton: "Entrar",
  registerButton: "Crear cuenta",
  loginError: "Nombre de usuario o contraseña inválidos",
  registrationError: "Registro fallido. Intenta con otro nombre de usuario.",
  forgotPassword: "¿Olvidaste tu contraseña?",
  needHelp: "¿Necesitas ayuda?",
  forgotPasswordMessage: "Por favor contacta a tu administrador para restablecer tu contraseña.",
  helpMessage: "Para obtener ayuda, por favor contacta a soporte en support@ubitrack.com",
  demoCredentials: "Credenciales de demostración: usuario \"admin\", contraseña \"admin123\"",
  backToWelcome: "Volver a la página de bienvenida",
  
  // Navigation
  dashboard: "Tablero",
  employees: "Empleados",
  locationTracking: "Seguimiento de ubicación",
  attendance: "Asistencia",
  teamChat: "Chat de equipo",
  chat: "Chat",
  reports: "Informes",
  settings: "Configuración",
  details: "Detalles",
  location: "Ubicación",
  locationDetails: "Detalles de ubicación",
  latitude: "Latitud",
  longitude: "Longitud",
  locationName: "Nombre de ubicación",
  detailedMapView: "Vista detallada del mapa próximamente",
  
  // Common actions
  save: "Guardar",
  cancel: "Cancelar",
  add: "Añadir",
  edit: "Editar",
  delete: "Eliminar",
  search: "Buscar",
  filter: "Filtrar",
  
  // Dashboard
  welcomeBack: "Bienvenido/a de nuevo",
  todaySummary: "Resumen de hoy",
  presentEmployees: "Presentes",
  absentEmployees: "Ausentes",
  lateEmployees: "Retrasados",
  upcomingEvents: "Próximos eventos",
  
  // Settings
  notifications: "Notificaciones",
  profile: "Perfil",
  
  // Location tracking
  locationDescription: "Monitorea ubicaciones de empleados en tiempo real",
  lastUpdated: "Última actualización",
  allEmployees: "Todos los empleados",
  onlineEmployees: "En línea",
  offlineEmployees: "Desconectados",
  awayEmployees: "Ausentes",
  
  // Employee details
  checkInTime: "Hora de entrada",
  currentLocation: "Ubicación actual",
  status: "Estado",
  lastUpdate: "Última actualización",
  message: "Mensaje",
  call: "Llamar",
  
  // Team chat
  typeMessage: "Escribe un mensaje...",
  sendMessage: "Enviar",
  onlineUsers: "en línea",
  
  // Search
  searchEmployees: "Buscar empleados...",
  searchTeam: "Buscar miembros del equipo...",
  
  // Status indicators
  active: "Activo",
  away: "Ausente",
  offline: "Desconectado",
  online: "En línea",
  working: "Trabajando",
  
  // Time indicators
  today: "Hoy",
  yesterday: "Ayer",
  now: "Ahora",
  minutesAgo: "min atrás",
  hoursAgo: "h atrás",
  
  // Team members
  teamMembers: "Miembros del equipo"
};

// Initialize i18next
i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      es: { translation: esTranslations }
    },
    lng: localStorage.getItem("language") || "en",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
