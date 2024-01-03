import httpStatus from 'http-status';

import { handleAsync } from '$/lib';
import { categoryService, noteService } from '$/services';
import {
  createCategorySchema,
  destroyCategorySchema,
  getCategoriesSchema,
  getCategoryNotesSchema,
  getCategorySchema,
  updateCategorySchema,
} from '$/validations';

const findAll = handleAsync(
  async ({ query, user: userId }, res) => {
    const allCategories = await categoryService.paginate(
      userId as string,
      query,
    );
    res.send(allCategories);
  },
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema: getCategoriesSchema,
    auth: 'verified',
  },
);

const findOne = handleAsync(
  async ({ params: { categoryId }, user: userId }, res) => {
    const category = await categoryService.findOne(
      categoryId,
      userId as string,
    );
    res.send(category);
  },
  {
    schema: getCategorySchema,
    auth: 'verified',
  },
);

const create = handleAsync(
  async ({ body, user: userId }, res) => {
    const createdCategory = await categoryService.create(
      body,
      userId as string,
    );
    res.status(httpStatus.CREATED).send(createdCategory);
  },
  {
    schema: createCategorySchema,
    auth: 'verified',
  },
);

const update = handleAsync(
  async ({ body, params: { categoryId }, user: userId }, res) => {
    const updatedCategory = await categoryService.update(
      categoryId,
      userId as string,
      body,
    );
    res.send(updatedCategory);
  },
  {
    schema: updateCategorySchema,
    auth: 'verified',
  },
);

const destroy = handleAsync(
  async ({ params: { categoryId }, user: userId }, res) => {
    await categoryService.destroy(categoryId, userId as string);
    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    schema: destroyCategorySchema,
    auth: 'verified',
  },
);

const findCategoryNotes = handleAsync(
  async ({ params: { categoryId }, user: userId, query }, res) => {
    await categoryService.findOne(categoryId, userId as string);

    const { include } = query;

    const categoryNotes = await noteService.paginate(
      userId as string,
      { ...query, include: { ...include, category: false } },
      { categoryId },
    );
    res.send(categoryNotes);
  },
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema: getCategoryNotesSchema,
    auth: 'verified',
  },
);

export { create, destroy, findAll, findCategoryNotes, findOne, update };
