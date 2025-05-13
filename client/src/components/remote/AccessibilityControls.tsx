
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

export const AccessibilityControls: React.FC = () => {
  const features = [
    { id: 'voice', name: 'Control por Voz' },
    { id: 'sight', name: 'Asistencia Visual' },
    { id: 'motion', name: 'Control de Movimiento' }
  ];

  return (
    <View>
      <Text>Controles de Accesibilidad</Text>
      {features.map(feature => (
        <TouchableOpacity key={feature.id}>
          <Text>{feature.name}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};
