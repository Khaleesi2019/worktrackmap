
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface RemoteConnectionProps {
  deviceId: string;
  isAdmin: boolean;
}

export const RemoteConnection: React.FC<RemoteConnectionProps> = ({ deviceId, isAdmin }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const peerConnection = useRef<RTCPeerConnection | null>(null);

  useEffect(() => {
    if (isAdmin) {
      initializeControlConnection();
    } else {
      initializeShareConnection();
    }
    return () => cleanupConnection();
  }, [isAdmin]);

  const initializeControlConnection = async () => {
    try {
      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      peerConnection.current.ontrack = (event) => {
        if (videoRef.current) {
          videoRef.current.srcObject = event.streams[0];
        }
      };

      setIsConnected(true);
    } catch (error) {
      console.error('Control connection error:', error);
    }
  };

  const initializeShareConnection = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false
      });

      peerConnection.current = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      stream.getTracks().forEach(track => {
        if (peerConnection.current) {
          peerConnection.current.addTrack(track, stream);
        }
      });

      setIsSharing(true);
    } catch (error) {
      console.error('Share connection error:', error);
    }
  };

  const cleanupConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
    setIsConnected(false);
    setIsSharing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      {isAdmin ? (
        <>
          <video ref={videoRef} autoPlay style={{ width: '100%', height: '100%' }} />
          <Text>Estado: {isConnected ? 'Conectado' : 'Desconectado'}</Text>
        </>
      ) : (
        <>
          <Text>Compartiendo pantalla: {isSharing ? 'Sí' : 'No'}</Text>
          <TouchableOpacity onPress={initializeShareConnection}>
            <Text>Iniciar compartir pantalla</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};
