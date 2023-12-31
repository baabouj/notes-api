import swaggerJsdoc from 'swagger-jsdoc';

import { config } from '$/config';

import { version } from '../../package.json';

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Notes API documentation',
    version,
  },
  servers: [
    {
      url: `http://localhost:${config.port}/api/v1`,
      description: 'Development server',
    },
  ],
};

const swaggerSpecs = swaggerJsdoc({
  swaggerDefinition,
  apis: ['src/docs/*.yml', 'src/routes/v1/*.ts'],
});

export { swaggerSpecs };
