import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// English translations
const enTranslations = {
  // General
  appName: "WorkTracker",
  loading: "Loading...",
  
  // Authentication
  login: "Login",
  logout: "Logout",
  username: "Username",
  password: "Password",
  loginButton: "Log In",
  loginError: "Invalid username or password",
  
  // Navigation
  dashboard: "Dashboard",
  employees: "Employees",
  locationTracking: "Location Tracking",
  attendance: "Attendance",
  teamChat: "Team Chat",
  chat: "Chat",
  reports: "Reports",
  settings: "Settings",
  
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
  darkMode: "Dark Mode",
  language: "Language",
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
  appName: "WorkTracker",
  loading: "Cargando...",
  
  // Authentication
  login: "Iniciar sesión",
  logout: "Cerrar sesión",
  username: "Nombre de usuario",
  password: "Contraseña",
  loginButton: "Iniciar sesión",
  loginError: "Nombre de usuario o contraseña inválidos",
  
  // Navigation
  dashboard: "Tablero",
  employees: "Empleados",
  locationTracking: "Seguimiento de ubicación",
  attendance: "Asistencia",
  teamChat: "Chat de equipo",
  chat: "Chat",
  reports: "Informes",
  settings: "Configuración",
  
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
  darkMode: "Modo oscuro",
  language: "Idioma",
  notifications: "Notificaciones",
  profile: "Perfil",
  
  // Location tracking
  locationDescription: "Monitorear ubicaciones de empleados en tiempo real",
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
