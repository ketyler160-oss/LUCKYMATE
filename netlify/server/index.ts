// Netlify Server entrypoint: runs the Luckymate Express + WebSocket backend.
// server.ts starts listening on process.env.PORT once its store has loaded.
import './production-env.ts';
import '../../server.ts';

export const config = {
  // The frontend is static (Vite build in dist/); the server only handles the
  // API and the crash-game WebSockets.
  path: ['/api/*', '/ws/*'],
  // Wallets, sessions and crash rounds are held in process memory and must be
  // shared by every player, so run a single instance.
  scale: { max: 1 },
};
