
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native-web';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AccessibilityControls } from './AccessibilityControls';

interface RemoteConnectionProps {
  deviceId: string;
  isAdmin: boolean;
}

export const RemoteConnection: React.FC<RemoteConnectionProps> = ({ deviceId, isAdmin }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [remoteId, setRemoteId] = useState('');
  const [password, setPassword] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [connectionMode, setConnectionMode] = useState<'attended' | 'unattended'>('attended');
  const [errorMessage, setErrorMessage] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const dataChannel = useRef<RTCDataChannel | null>(null);

  useEffect(() => {
    // Generar un ID de sesión aleatorio para este dispositivo
    if (!sessionId) {
      setSessionId(Math.random().toString(36).substring(2, 10));
    }
    
    return () => cleanupConnection();
  }, []);

  const initializeControlConnection = async () => {
    try {
      setErrorMessage('');
      
      if (!remoteId) {
        setErrorMessage('Por favor ingrese el ID del dispositivo remoto');
        return;
      }

      // Configurar conexión WebRTC
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      // Configurar canal de datos para enviar comandos de control
      dataChannel.current = peerConnection.current.createDataChannel('control', {
        ordered: true
      });
      
      dataChannel.current.onopen = () => {
        console.log('Canal de datos abierto');
      };
      
      dataChannel.current.onmessage = (event) => {
        console.log('Mensaje recibido:', event.data);
        handleRemoteCommand(event.data);
      };
      
      // Manejar flujos de medios entrantes
      peerConnection.current.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };
      
      // Enviar oferta para iniciar la conexión
      const offer = await peerConnection.current.createOffer();
      await peerConnection.current.setLocalDescription(offer);
      
      // Aquí iría el código para enviar la oferta al servidor para que la reenvíe al peer remoto
      // simulamos una conexión exitosa después de un corto delay
      setTimeout(() => {
        setIsConnected(true);
      }, 1500);
      
    } catch (error) {
      console.error('Error de conexión:', error);
      setErrorMessage('Error al establecer la conexión: ' + (error as Error).message);
    }
  };

  const initializeShareConnection = async () => {
    try {
      setErrorMessage('');
      
      // Solicitar permisos para capturar la pantalla
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          displaySurface: 'monitor'
        },
        audio: false
      });

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      // Agregar todos los tracks al peer connection
      stream.getTracks().forEach(track => {
        if (peerConnection.current) {
          peerConnection.current.addTrack(track, stream);
        }
      });
      
      // Manejar canal de datos entrante
      peerConnection.current.ondatachannel = (event) => {
        dataChannel.current = event.channel;
        dataChannel.current.onmessage = (e) => {
          handleControlCommand(e.data);
        };
      };
      
      // Actualizar la UI
      setIsSharing(true);
      
      // Mostrar vista previa local
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (error) {
      console.error('Error al compartir pantalla:', error);
      setErrorMessage('Error al compartir pantalla: ' + (error as Error).message);
    }
  };

  const handleRemoteCommand = (data: string) => {
    // Implementar lógica para procesar comandos recibidos del dispositivo remoto
    try {
      const command = JSON.parse(data);
      console.log('Comando recibido:', command);
      
      switch (command.type) {
        case 'mouse':
          // Simular eventos del mouse
          break;
        case 'keyboard':
          // Simular eventos del teclado
          break;
        case 'accessibility':
          // Manejar comandos de accesibilidad
          break;
      }
    } catch (e) {
      console.error('Error al procesar comando:', e);
    }
  };
  
  const handleControlCommand = (data: string) => {
    // Implementar lógica para procesar comandos de control enviados al dispositivo compartido
    try {
      const command = JSON.parse(data);
      
      // Aquí implementaríamos la lógica para ejecutar los comandos en el sistema
      console.log('Comando de control recibido:', command);
    } catch (e) {
      console.error('Error al procesar comando de control:', e);
    }
  };

  const sendControlCommand = (commandType: string, data: any) => {
    if (dataChannel.current && dataChannel.current.readyState === 'open') {
      const command = {
        type: commandType,
        ...data
      };
      dataChannel.current.send(JSON.stringify(command));
    }
  };
  
  const handleMouseEvent = (event: React.MouseEvent<HTMLVideoElement>) => {
    if (isConnected && videoRef.current) {
      const rect = videoRef.current.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      
      sendControlCommand('mouse', {
        x, y,
        type: event.type, // mousedown, mousemove, mouseup
        button: event.button
      });
    }
  };

  const cleanupConnection = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    if (dataChannel.current) {
      dataChannel.current.close();
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    
    setIsConnected(false);
    setIsSharing(false);
  };

  // Funciones para soporte de accesibilidad
  const configureAccessibilityMode = (mode: 'visual' | 'hearing' | 'motor') => {
    // Implementar configuraciones específicas para diferentes tipos de discapacidades
    console.log(`Configurando modo de accesibilidad: ${mode}`);
    
    switch (mode) {
      case 'visual':
        // Configurar comandos por voz, texto a voz
        break;
      case 'hearing':
        // Activar subtítulos, notificaciones visuales
        break;
      case 'motor':
        // Activar control por voz, seguimiento ocular
        break;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Kalani Virtual - Asistencia Remota</CardTitle>
        {isAdmin ? 
          <Text>Control Remoto (Administrador)</Text> : 
          <Text>ID de su dispositivo: {sessionId}</Text>
        }
      </CardHeader>
      <CardContent>
        {isAdmin ? (
          <View style={{ width: '100%' }}>
            <Tabs defaultValue="connect">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="connect">Conectar</TabsTrigger>
                <TabsTrigger value="settings">Configuración</TabsTrigger>
              </TabsList>
              
              <TabsContent value="connect">
                <View style={{ gap: 10, marginBottom: 15 }}>
                  <Input 
                    type="text" 
                    value={remoteId}
                    onChange={(e) => setRemoteId(e.target.value)}
                    placeholder="ID del dispositivo remoto" 
                  />
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Contraseña (opcional)" 
                  />
                  
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button 
                      onClick={initializeControlConnection}
                      className="flex-1"
                    >
                      Conectar
                    </Button>
                    <Button 
                      onClick={cleanupConnection}
                      variant="outline"
                      className="flex-1"
                      disabled={!isConnected}
                    >
                      Desconectar
                    </Button>
                  </View>
                  
                  {errorMessage && <Text style={{ color: 'red' }}>{errorMessage}</Text>}
                </View>
                
                {isConnected && (
                  <View style={{ width: '100%' }}>
                    <Text>Conectado a: {remoteId}</Text>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      style={{ width: '100%', height: 'auto', border: '1px solid #ccc', borderRadius: '4px' }}
                      onMouseDown={handleMouseEvent}
                      onMouseMove={handleMouseEvent}
                      onMouseUp={handleMouseEvent}
                    />
                    
                    <AccessibilityControls />
                  </View>
                )}
              </TabsContent>
              
              <TabsContent value="settings">
                <View style={{ gap: 10 }}>
                  <Text className="font-medium">Modo de conexión:</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button 
                      variant={connectionMode === 'attended' ? 'default' : 'outline'}
                      onClick={() => setConnectionMode('attended')}
                    >
                      Atendida
                    </Button>
                    <Button 
                      variant={connectionMode === 'unattended' ? 'default' : 'outline'}
                      onClick={() => setConnectionMode('unattended')}
                    >
                      No atendida
                    </Button>
                  </View>
                  
                  <Text className="font-medium mt-4">Configuración de accesibilidad:</Text>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Button onClick={() => configureAccessibilityMode('visual')}>
                      Discapacidad visual
                    </Button>
                    <Button onClick={() => configureAccessibilityMode('hearing')}>
                      Discapacidad auditiva
                    </Button>
                    <Button onClick={() => configureAccessibilityMode('motor')}>
                      Discapacidad motora
                    </Button>
                  </View>
                </View>
              </TabsContent>
            </Tabs>
          </View>
        ) : (
          <View style={{ width: '100%', gap: 15 }}>
            <Text>Para recibir asistencia, comparta este ID con el administrador: <Text style={{ fontWeight: 'bold' }}>{sessionId}</Text></Text>
            
            {!isSharing ? (
              <View>
                <Text style={{ marginBottom: 10 }}>
                  Al iniciar la compartición de pantalla, permitirá que un técnico le brinde asistencia remota.
                </Text>
                <Button onClick={initializeShareConnection}>
                  Iniciar compartir pantalla
                </Button>
                {errorMessage && <Text style={{ color: 'red', marginTop: 10 }}>{errorMessage}</Text>}
              </View>
            ) : (
              <View>
                <Text style={{ marginBottom: 10 }}>Compartiendo pantalla</Text>
                <video 
                  ref={videoRef} 
                  autoPlay 
                  muted
                  style={{ width: '100%', height: 'auto', border: '1px solid #ccc', borderRadius: '4px' }} 
                />
                <Button 
                  onClick={cleanupConnection}
                  variant="destructive"
                  className="mt-4"
                >
                  Detener compartición
                </Button>
              </View>
            )}
          </View>
        )}
      </CardContent>
    </Card>
  );
};
