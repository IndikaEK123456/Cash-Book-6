
import Peer, { DataConnection } from 'peerjs';
import { DeviceState } from '../types';

const STORAGE_KEY = 'shivas_cabanas_state';
const PAIRING_ID_KEY = 'shivas_pairing_id';

class SyncService {
  private peer: Peer | null = null;
  private connections: DataConnection[] = [];
  private onStateUpdate: ((state: DeviceState) => void) | null = null;
  private onStatusUpdate: ((status: string) => void) | null = null;

  constructor() {
    this.initPeer();
  }

  private initPeer() {
    const savedId = localStorage.getItem(PAIRING_ID_KEY);
    // Laptop needs a consistent ID to be found, Mobile needs it to connect
    this.peer = new Peer(savedId || undefined);

    this.peer.on('open', (id) => {
      console.log('My Peer ID:', id);
      if (!savedId) {
        localStorage.setItem(PAIRING_ID_KEY, id);
      }
      this.onStatusUpdate?.('Ready');
      
      // If we are a mobile device, we should try to connect to the laptop
      // In this version, we assume the user provides the Laptop ID once.
    });

    this.peer.on('connection', (conn) => {
      console.log('Incoming connection from mobile...');
      this.connections.push(conn);
      this.setupConnection(conn);
      this.onStatusUpdate?.(`Connected (${this.connections.length})`);
      
      // Send current state immediately to the new mobile
      const state = this.loadLocalState();
      conn.send(state);
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
      this.onStatusUpdate?.('Error: ' + err.type);
    });
  }

  private setupConnection(conn: DataConnection) {
    conn.on('data', (data: any) => {
      console.log('Received data:', data);
      if (this.onStateUpdate) {
        this.onStateUpdate(data as DeviceState);
        this.saveLocalState(data as DeviceState);
      }
    });

    conn.on('close', () => {
      this.connections = this.connections.filter(c => c !== conn);
      this.onStatusUpdate?.(this.connections.length > 0 ? `Connected (${this.connections.length})` : 'Ready');
    });
  }

  // Mobile calls this to pair with Laptop
  public connectToLaptop(laptopId: string) {
    if (!this.peer) return;
    const conn = this.peer.connect(laptopId);
    this.setupConnection(conn);
    this.connections = [conn]; // Mobile only connects to one laptop
    localStorage.setItem('laptop_host_id', laptopId);
    this.onStatusUpdate?.('Connecting...');
  }

  public broadcastState(state: DeviceState) {
    this.saveLocalState(state);
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send(state);
      }
    });
  }

  public saveLocalState(state: DeviceState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  public loadLocalState(): DeviceState {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
    return {
      currentData: {
        date: new Date().toLocaleDateString(),
        outPartyEntries: [],
        mainEntries: [],
        openingBalance: 0
      },
      history: [],
      rates: { usd: 0, euro: 0 }
    };
  }

  public subscribe(onUpdate: (state: DeviceState) => void, onStatus: (status: string) => void) {
    this.onStateUpdate = onUpdate;
    this.onStatusUpdate = onStatus;
    
    // Auto-reconnect logic for Mobile
    const hostId = localStorage.getItem('laptop_host_id');
    if (hostId && window.location.hash.includes('mobile') || window.location.hash.includes('android') || window.location.hash.includes('iphone')) {
        setTimeout(() => this.connectToLaptop(hostId), 2000);
    }
  }

  public getMyId(): string {
    return this.peer?.id || 'Initializing...';
  }
}

export const syncService = new SyncService();
