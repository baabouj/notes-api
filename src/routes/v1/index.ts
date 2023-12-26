import { Router } from 'express';

import { authRouter } from './auth.route';
import { categoriesRouter } from './categories.route';
import { notesRouter } from './notes.route';
import { tagsRouter } from './tags.route';

const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/notes', notesRouter);
v1Router.use('/categories', categoriesRouter);
v1Router.use('/tags', tagsRouter);

export { v1Router };
