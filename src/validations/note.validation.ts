import { z } from 'zod';

import { paginationSchema } from './pagination.validation';

const noteInclude = z
  .string()
  .transform((include) => {
    const items = include.split(',');
    const includeCategory = items.includes('category');
    const includeTags = items.includes('tags');
    return {
      category: includeCategory,
      tags: includeTags,
    };
  })
  .default('');

const noteIncludeSchema = z.object({
  include: noteInclude,
});

const noteParamsSchema = z.object({
  noteId: z.string().cuid(),
});

const getNotesSchema = {
  query: paginationSchema.extend({
    ...noteIncludeSchema.shape,
  }),
};

const createNoteSchema = {
  body: z.object({
    title: z.string({
      required_error: 'title is required',
    }),
    content: z.string({
      required_error: 'content is required',
    }),
    tags: z
      .array(z.string())
      .max(4, "a note can't have more than 4 tages")
      .optional(),
    categoryId: z.string().cuid().optional(),
  }),
};

const updateNoteSchema = {
  body: z.object({
    title: z.string().optional(),
    content: z.string().optional(),
    tags: z
      .array(z.string())
      .max(4, "a note can't have more than 4 tages")
      .optional(),
    categoryId: z.string().cuid().nullable().optional(),
  }),
  params: noteParamsSchema,
};

const destroyNoteSchema = {
  params: noteParamsSchema,
};

const getNoteSchema = {
  query: noteIncludeSchema,
  params: noteParamsSchema,
};

const findNoteCategorySchema = {
  params: noteParamsSchema,
};

const findNoteTagsSchema = {
  params: noteParamsSchema,
};

type NoteIncludeSchema = z.infer<typeof noteIncludeSchema>;
type NoteInclude = z.infer<typeof noteInclude>;
type GetNotesQuery = z.infer<typeof getNotesSchema.query>;
type GetNoteQuery = z.infer<typeof getNoteSchema.query>;
type GetNoteParams = z.infer<typeof getNoteSchema.params>;
type CreateNoteBody = z.infer<typeof createNoteSchema.body>;
type UpdateNoteBody = z.infer<typeof updateNoteSchema.body>;

export {
  CreateNoteBody,
  createNoteSchema,
  destroyNoteSchema,
  findNoteCategorySchema,
  findNoteTagsSchema,
  GetNoteParams,
  GetNoteQuery,
  getNoteSchema,
  GetNotesQuery,
  getNotesSchema,
  NoteInclude,
  NoteIncludeSchema,
  noteIncludeSchema,
  noteParamsSchema,
  UpdateNoteBody,
  updateNoteSchema,
};
