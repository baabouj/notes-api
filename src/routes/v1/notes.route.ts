import { Router } from 'express';

import { noteController } from '$/controllers';

const notesRouter = Router();

notesRouter.route('/').get(noteController.findAll).post(noteController.create);

notesRouter
  .route('/:noteId')
  .get(noteController.findOne)
  .patch(noteController.update)
  .delete(noteController.destroy);

notesRouter.get('/:noteId/category', noteController.findNoteCategory);
notesRouter.get('/:noteId/tags', noteController.findNoteTags);

export { notesRouter };
