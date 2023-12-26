import { z } from 'zod';

import { getNotesSchema } from './note.validation';
import { paginationSchema } from './pagination.validation';

const categoryParamsSchema = z.object({
  categoryId: z.string().cuid(),
});

const getCategoriesSchema = {
  query: paginationSchema,
};

const getCategorySchema = {
  params: categoryParamsSchema,
};

const createCategorySchema = {
  body: z.object({
    name: z.string({
      required_error: 'category name is required',
    }),
  }),
};

const updateCategorySchema = {
  body: z.object({
    name: z.string().optional(),
  }),
  params: categoryParamsSchema,
};

const destroyCategorySchema = {
  params: categoryParamsSchema,
};

const getCategoryNotesSchema = {
  ...getNotesSchema,
  params: categoryParamsSchema,
};

type CreateCategoryBody = z.infer<typeof createCategorySchema.body>;
type UpdateCategoryBody = z.infer<typeof updateCategorySchema.body>;

export {
  categoryParamsSchema,
  CreateCategoryBody,
  createCategorySchema,
  destroyCategorySchema,
  getCategoriesSchema,
  getCategoryNotesSchema,
  getCategorySchema,
  UpdateCategoryBody,
  updateCategorySchema,
};
