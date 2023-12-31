import { Router } from 'express';
import swaggerUi from 'swagger-ui-express';

import { swaggerSpecs } from '$/docs/swagger';

const docsRouter = Router();

docsRouter.use('/', swaggerUi.serve);

docsRouter.get(
  '/',
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
  }),
);

export { docsRouter };
