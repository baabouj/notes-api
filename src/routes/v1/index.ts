import { Router } from 'express';

import { authRouter } from './auth.route';
import { notesRouter } from './notes.route';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/notes', notesRouter);

export { v1Router };
