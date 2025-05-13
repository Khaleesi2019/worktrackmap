
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { RemoteConnection } from '@/components/remote/RemoteConnection';

export default function RemoteAssistance() {
  const { user } = useAuth();
  const [deviceId] = useState(`device-${Math.random().toString(36).substring(2, 10)}`);
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Kalani Virtual - Asistencia Remota</h1>
      
      <div className="mb-4">
        <p className="text-muted-foreground">
          Kalani Virtual permite la asistencia remota para usuarios con discapacidades, 
          ofreciendo un sistema de control remoto accesible y adaptado a diferentes necesidades.
        </p>
      </div>
      
      <RemoteConnection 
        deviceId={deviceId} 
        isAdmin={user?.role === 'Administrator'} 
      />
      
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-accent rounded-lg p-4 text-center">
          <div className="text-3xl text-primary mb-2">
            <i className="fas fa-universal-access"></i>
          </div>
          <h3 className="font-semibold">Accesibilidad Universal</h3>
          <p className="text-sm text-muted-foreground">
            Diseñado específicamente para personas con diferentes tipos de discapacidades
          </p>
        </div>
        
        <div className="bg-accent rounded-lg p-4 text-center">
          <div className="text-3xl text-primary mb-2">
            <i className="fas fa-desktop"></i>
          </div>
          <h3 className="font-semibold">Control Remoto</h3>
          <p className="text-sm text-muted-foreground">
            Control total de dispositivos remotos para brindar asistencia técnica
          </p>
        </div>
        
        <div className="bg-accent rounded-lg p-4 text-center">
          <div className="text-3xl text-primary mb-2">
            <i className="fas fa-shield-alt"></i>
          </div>
          <h3 className="font-semibold">Conexión Segura</h3>
          <p className="text-sm text-muted-foreground">
            Todas las conexiones están cifradas para garantizar la privacidad
          </p>
        </div>
      </div>
    </div>
  );
}
