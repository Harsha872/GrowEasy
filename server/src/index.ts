import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });
import { createApp } from './app';
import { logger } from './utils/logger';

const app = createApp();
const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  logger.info(`server listening`, { port: PORT });
});

export default app;
