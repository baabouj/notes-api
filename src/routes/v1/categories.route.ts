import { Router } from 'express';

import { categoryController } from '$/controllers';

const categoriesRouter = Router();

categoriesRouter
  .route('/')
  .get(categoryController.findAll)
  .post(categoryController.create);

categoriesRouter
  .route('/:categoryId')
  .get(categoryController.findOne)
  .patch(categoryController.update)
  .delete(categoryController.destroy);

categoriesRouter.get(
  '/:categoryId/notes',
  categoryController.findCategoryNotes,
);

export { categoriesRouter };
