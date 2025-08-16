import makeWASocket, {
  DisconnectReason,
  fetchLatestBaileysVersion,
  useMultiFileAuthState,
  WASocket,
} from '@adiwajshing/baileys';
import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import pino from 'pino';

interface RunningSession {
  id: string;
  sock?: WASocket;
  authPath: string;
  status: 'OFFLINE' | 'CONNECTING' | 'ONLINE' | 'LOGGED_OUT';
  lastQR?: string | null;
}

@Injectable()
export class SessionsService {
  private readonly logger = new Logger(SessionsService.name);
  private readonly sessions = new Map<string, RunningSession>();

  list() {
    return Array.from(this.sessions.values()).map(({ sock, ...rest }) => rest);
  }

  get(id: string) {
    const s = this.sessions.get(id);
    if (!s) throw new Error('Session not found');
    const { sock, ...rest } = s;
    return rest;
  }

  async create(name: string, tenantId?: string) {
    const id = name.toLowerCase().replace(/[^a-z0-9-_]/g, '-') + '-' + Date.now();
    const authPath = join(process.cwd(), 'auth', id);
    if (!existsSync(authPath)) mkdirSync(authPath, { recursive: true });
  const s: RunningSession = { id, authPath, status: 'OFFLINE', lastQR: null };
    this.sessions.set(id, s);
    return { id, authPath, tenantId };
  }

  async start(id: string) {
    const s = this.sessions.get(id);
    if (!s) throw new Error('Session not found');
    if (s.sock) return { id, status: s.status };
    s.status = 'CONNECTING';

  const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
    const { state, saveCreds } = await useMultiFileAuthState(s.authPath);
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
  logger: logger as any,
      printQRInTerminal: true,
      auth: state,
      version,
      syncFullHistory: false,
    });

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', ({ connection, lastDisconnect, qr }) => {
      this.logger.log(`connection.update ${id}: ${connection}`);
      if (qr) {
        s.lastQR = qr;
      }
      if (connection === 'open') {
        s.status = 'ONLINE';
        s.lastQR = null;
      } else if (connection === 'close') {
        const code = (lastDisconnect?.error as any)?.output?.statusCode;
        const reason = DisconnectReason[code as DisconnectReason];
        this.logger.warn(`Disconnected ${id}: code=${code} reason=${reason}`);
        if (code === DisconnectReason.loggedOut) {
          s.status = 'LOGGED_OUT';
          s.sock = undefined;
        } else {
          s.status = 'OFFLINE';
          s.sock = undefined;
        }
      }
    });

    sock.ev.on('messages.upsert', async ({ messages }) => {
      for (const m of messages) {
        this.logger.debug(`msg ${id}: ${m.key.remoteJid}`);
      }
    });

    s.sock = sock;
    return { id, status: s.status };
  }

  async stop(id: string) {
    const s = this.sessions.get(id);
    if (!s?.sock) return { id, status: s?.status ?? 'OFFLINE' };
    await s.sock.logout();
    s.sock = undefined;
    s.status = 'OFFLINE';
    return { id, status: s.status };
  }

  async remove(id: string) {
    const s = this.sessions.get(id);
    if (s?.sock) await this.stop(id);
    this.sessions.delete(id);
    return { id, removed: true };
  }

  getQR(id: string) {
    const s = this.sessions.get(id);
    if (!s) throw new Error('Session not found');
    return { id, qr: s.lastQR ?? null };
  }
}
