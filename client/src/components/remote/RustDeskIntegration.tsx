
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface RustDeskIntegrationProps {
  className?: string;
}

export const RustDeskIntegration: React.FC<RustDeskIntegrationProps> = ({ className }) => {
  const [serverId, setServerId] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('Disconnected');
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if RustDesk is installed
    fetch('/api/rustdesk/status')
      .then(res => res.json())
      .then(data => {
        setIsInstalled(data.installed);
      })
      .catch(err => {
        console.error('Failed to check RustDesk status:', err);
        setIsInstalled(false);
      });
  }, []);

  const handleConnect = () => {
    if (!serverId) {
      alert('Please enter a Server ID');
      return;
    }
    
    setStatus('Connecting...');
    
    // In a real implementation, this would call an API endpoint that uses the RustDesk CLI
    fetch('/api/rustdesk/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ serverId, password }),
    })
      .then(res => res.json())
      .then(data => {
        setStatus(data.success ? 'Connected' : 'Failed to connect');
      })
      .catch(err => {
        console.error('Failed to connect:', err);
        setStatus('Connection error');
      });
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>RustDesk Remote Connection</CardTitle>
      </CardHeader>
      <CardContent>
        {!isInstalled ? (
          <div className="text-center">
            <p className="mb-4">RustDesk is not installed on the server.</p>
            <Button 
              onClick={() => window.open('https://github.com/rustdesk/rustdesk/releases', '_blank')}
            >
              Download RustDesk
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label htmlFor="server-id" className="block text-sm font-medium mb-1">Server ID</label>
                <Input
                  id="server-id"
                  value={serverId}
                  onChange={(e) => setServerId(e.target.value)}
                  placeholder="Enter Server ID"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-1">Password (if required)</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                />
              </div>
              
              <Button 
                onClick={handleConnect}
                className="w-full"
              >
                Connect
              </Button>
              
              <div className="text-center mt-4">
                <p>Status: <span className="font-medium">{status}</span></p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
