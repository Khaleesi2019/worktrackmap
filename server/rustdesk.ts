
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

export async function checkRustDeskInstalled() {
  try {
    await execAsync('which rustdesk');
    return true;
  } catch (error) {
    return false;
  }
}

export async function connectToRustDesk(serverId: string, password?: string) {
  try {
    if (!serverId) {
      throw new Error('Server ID is required');
    }
    
    let command = `rustdesk --connect ${serverId}`;
    if (password) {
      command += ` --password ${password}`;
    }
    
    await execAsync(command);
    return { success: true };
  } catch (error) {
    console.error('Failed to connect to RustDesk:', error);
    return { success: false, error: (error as Error).message };
  }
}

export async function installRustDesk() {
  try {
    // Note: This is a simplified version and may not work on all systems
    await execAsync('curl -L https://github.com/rustdesk/rustdesk/releases/latest/download/rustdesk-linux-x86_64.deb -o /tmp/rustdesk.deb');
    await execAsync('apt-get update && apt-get install -y /tmp/rustdesk.deb');
    return { success: true };
  } catch (error) {
    console.error('Failed to install RustDesk:', error);
    return { success: false, error: (error as Error).message };
  }
}
