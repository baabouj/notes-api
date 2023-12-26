import { Router } from 'express';

import { tagController } from '$/controllers';

const tagsRouter = Router();

tagsRouter.route('/').get(tagController.findAll).post(tagController.create);

tagsRouter
  .route('/:tagId')
  .get(tagController.findOne)
  .patch(tagController.update)
  .delete(tagController.destroy);

tagsRouter.get('/:tagId/notes', tagController.findNotes);

export { tagsRouter };
