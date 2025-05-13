
import React from 'react';
import { RustDeskIntegration } from '@/components/remote/RustDeskIntegration';

export default function RustDeskPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">RustDesk Remote Desktop</h1>
      <p className="mb-6">Connect to remote computers securely with RustDesk.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <RustDeskIntegration className="md:col-span-1" />
        
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-3">Instructions</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Install RustDesk on both computers</li>
            <li>Get the ID from the remote computer</li>
            <li>Enter the ID in the form</li>
            <li>Enter password if required</li>
            <li>Click Connect</li>
          </ul>
          
          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <h3 className="text-lg font-medium text-yellow-700">Note</h3>
            <p className="text-yellow-600">
              For full functionality, you'll need to download and install the RustDesk client 
              on your local machine as well.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
