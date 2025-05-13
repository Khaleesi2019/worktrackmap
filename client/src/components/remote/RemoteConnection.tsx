
import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import WebRTC from 'react-native-webrtc';

interface RemoteConnectionProps {
  deviceId: string;
  isAdmin: boolean;
}

export const RemoteConnection: React.FC<RemoteConnectionProps> = ({ deviceId, isAdmin }) => {
  const peerConnection = useRef<any>(null);

  useEffect(() => {
    initializeConnection();
    return () => cleanupConnection();
  }, []);

  const initializeConnection = async () => {
    try {
      peerConnection.current = new WebRTC.RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });
      
      // Add connection handlers
      if (isAdmin) {
        setupAdminConnection();
      } else {
        setupClientConnection();
      }
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  const setupAdminConnection = () => {
    // Admin-specific connection logic
  };

  const setupClientConnection = () => {
    // Client-specific connection logic with auto-accept
  };

  const cleanupConnection = () => {
    if (peerConnection.current) {
      peerConnection.current.close();
    }
  };

  return (
    <View>
      <Text>Estado de conexión: {peerConnection.current ? 'Activo' : 'Desconectado'}</Text>
      {isAdmin && (
        <TouchableOpacity onPress={initializeConnection}>
          <Text>Reconectar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};
