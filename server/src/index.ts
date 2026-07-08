import 'dotenv/config';
import { createApp } from './app';
import { logger } from './utils/logger';

const app = createApp();
const PORT = Number(process.env.PORT ?? 4000);

app.listen(PORT, () => {
  logger.info(`server listening`, { port: PORT });
});

export default app;
