import { Router } from 'express';

import { config } from '$/config';
import { rateLimit } from '$/middlewares';

import { authRouter } from './auth.route';
import { categoriesRouter } from './categories.route';
import { docsRouter } from './docs.route';
import { notesRouter } from './notes.route';
import { tagsRouter } from './tags.route';

const v1Router = Router();

if (config.env === 'production') {
  authRouter.use(rateLimit);
}

v1Router.use('/auth', authRouter);
v1Router.use('/notes', notesRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/tags', tagsRouter);
v1Router.use('/docs', docsRouter);

v1Router.get('/health', (req, res) =>
  res.send({
    message: 'Ok',
  }),
);

export { v1Router };
