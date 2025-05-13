
import React, { useState } from 'react';
import { View, Text } from 'react-native-web';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent } from '../ui/card';

interface AccessibilityFeature {
  id: string;
  name: string;
  enabled: boolean;
  description: string;
}

export const AccessibilityControls: React.FC = () => {
  const [visualFeatures, setVisualFeatures] = useState<AccessibilityFeature[]>([
    { id: 'highContrast', name: 'Alto contraste', enabled: false, description: 'Mejora la visibilidad con más contraste' },
    { id: 'screenReader', name: 'Lector de pantalla', enabled: false, description: 'Lee el contenido de la pantalla' },
    { id: 'zoom', name: 'Ampliación', enabled: false, description: 'Permite hacer zoom en áreas específicas' }
  ]);
  
  const [motorFeatures, setMotorFeatures] = useState<AccessibilityFeature[]>([
    { id: 'voiceControl', name: 'Control por voz', enabled: false, description: 'Permite controlar usando comandos de voz' },
    { id: 'eyeTracking', name: 'Seguimiento ocular', enabled: false, description: 'Control mediante movimientos oculares' },
    { id: 'autoClick', name: 'Clic automático', enabled: false, description: 'Realiza clics automáticamente al detenerse' }
  ]);
  
  const [magnificationLevel, setMagnificationLevel] = useState<number[]>([2]);
  const [voiceSensitivity, setVoiceSensitivity] = useState<number[]>([7]);
  const [scanningSpeed, setScanningSpeed] = useState<number[]>([5]);
  
  const toggleFeature = (featureId: string, featureType: 'visual' | 'motor') => {
    if (featureType === 'visual') {
      setVisualFeatures(features => 
        features.map(f => 
          f.id === featureId ? { ...f, enabled: !f.enabled } : f
        )
      );
    } else {
      setMotorFeatures(features => 
        features.map(f => 
          f.id === featureId ? { ...f, enabled: !f.enabled } : f
        )
      );
    }
    
    // Aquí se implementaría la lógica para activar/desactivar la función en el sistema remoto
    console.log(`Toggling ${featureId}: ${!visualFeatures.find(f => f.id === featureId)?.enabled}`);
  };
  
  const sendAccessibilityCommand = (command: string, value: any) => {
    // Aquí se implementaría la lógica para enviar comandos al sistema remoto
    console.log(`Sending accessibility command: ${command} with value: ${value}`);
  };
  
  return (
    <Card className="mt-4">
      <CardContent className="pt-4">
        <Tabs defaultValue="visual">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="visual">Discapacidad Visual</TabsTrigger>
            <TabsTrigger value="motor">Discapacidad Motora</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual">
            <View style={{ gap: 15 }}>
              {visualFeatures.map(feature => (
                <View key={feature.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text className="font-medium">{feature.name}</Text>
                    <Text className="text-muted-foreground text-sm">{feature.description}</Text>
                  </View>
                  <Switch 
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id, 'visual')}
                  />
                </View>
              ))}
              
              <View style={{ marginTop: 15 }}>
                <Text className="font-medium mb-2">Nivel de ampliación: {magnificationLevel[0]}x</Text>
                <Slider 
                  value={magnificationLevel}
                  onValueChange={(value) => {
                    setMagnificationLevel(value);
                    sendAccessibilityCommand('magnification', value[0]);
                  }}
                  min={1}
                  max={10}
                  step={0.5}
                />
              </View>
              
              <Button 
                onClick={() => sendAccessibilityCommand('read-screen', true)}
                className="mt-2"
              >
                Leer pantalla actual
              </Button>
            </View>
          </TabsContent>
          
          <TabsContent value="motor">
            <View style={{ gap: 15 }}>
              {motorFeatures.map(feature => (
                <View key={feature.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text className="font-medium">{feature.name}</Text>
                    <Text className="text-muted-foreground text-sm">{feature.description}</Text>
                  </View>
                  <Switch 
                    checked={feature.enabled}
                    onCheckedChange={() => toggleFeature(feature.id, 'motor')}
                  />
                </View>
              ))}
              
              <View style={{ marginTop: 15 }}>
                <Text className="font-medium mb-2">Sensibilidad de voz: {voiceSensitivity[0]}</Text>
                <Slider 
                  value={voiceSensitivity}
                  onValueChange={(value) => {
                    setVoiceSensitivity(value);
                    sendAccessibilityCommand('voice-sensitivity', value[0]);
                  }}
                  min={1}
                  max={10}
                  step={1}
                />
              </View>
              
              <View style={{ marginTop: 15 }}>
                <Text className="font-medium mb-2">Velocidad de escaneo: {scanningSpeed[0]}</Text>
                <Slider 
                  value={scanningSpeed}
                  onValueChange={(value) => {
                    setScanningSpeed(value);
                    sendAccessibilityCommand('scanning-speed', value[0]);
                  }}
                  min={1}
                  max={10}
                  step={1}
                />
              </View>
              
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <Button onClick={() => sendAccessibilityCommand('left-click', {})}>
                  Clic Izquierdo
                </Button>
                <Button onClick={() => sendAccessibilityCommand('right-click', {})}>
                  Clic Derecho
                </Button>
                <Button onClick={() => sendAccessibilityCommand('drag', true)}>
                  Arrastrar
                </Button>
              </View>
            </View>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
