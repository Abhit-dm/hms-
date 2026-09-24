import 'dotenv/config';
import { app, prisma } from './app.js';

const port = Number(process.env.PORT || 5000);
const server = app.listen(port, () => console.log(`HMS API listening on http://localhost:${port}`));
async function shutdown(signal) { console.log(`${signal} received; closing HMS API`); server.close(async () => { await prisma.$disconnect(); process.exit(0); }); setTimeout(() => process.exit(1), 10000).unref(); }
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('uncaughtException', (error) => { console.error('Uncaught exception', error); shutdown('uncaughtException'); });
process.on('unhandledRejection', (error) => { console.error('Unhandled rejection', error); shutdown('unhandledRejection'); });
