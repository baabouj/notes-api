import { z } from 'zod';

import { getNotesSchema } from './note.validation';
import { paginationSchema } from './pagination.validation';

const tagParamsSchema = z.object({
  tagId: z.string().cuid(),
});

const getTagsSchema = {
  query: paginationSchema,
};

const getTagSchema = {
  params: tagParamsSchema,
};

const createTagSchema = {
  body: z.object({
    name: z.string({
      required_error: 'tag name is required',
    }),
  }),
};

const updateTagSchema = {
  body: z.object({
    name: z.string().optional(),
  }),
  params: tagParamsSchema,
};

const destroyTagSchema = {
  params: tagParamsSchema,
};

const getTagNotesSchema = {
  ...getNotesSchema,
  params: tagParamsSchema,
};

type CreateTagBody = z.infer<typeof createTagSchema.body>;
type UpdateTagBody = z.infer<typeof updateTagSchema.body>;

export {
  CreateTagBody,
  createTagSchema,
  destroyTagSchema,
  getTagNotesSchema,
  getTagSchema,
  getTagsSchema,
  tagParamsSchema,
  UpdateTagBody,
  updateTagSchema,
};
