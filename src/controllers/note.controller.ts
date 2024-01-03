import httpStatus from 'http-status';

import { handleAsync } from '$/lib';
import { noteService } from '$/services';
import {
  createNoteSchema,
  destroyNoteSchema,
  findNoteCategorySchema,
  findNoteTagsSchema,
  getNoteSchema,
  getNotesSchema,
  updateNoteSchema,
} from '$/validations';

const findAll = handleAsync(
  async ({ user: userId, query }, res) => {
    const paginatedNotes = await noteService.paginate(userId as string, query);
    res.send(paginatedNotes);
  },
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema: getNotesSchema,
    auth: 'verified',
  },
);

const findOne = handleAsync(
  async ({ params: { noteId }, user: userId, query: { include } }, res) => {
    const note = await noteService.findOne(noteId, userId as string, include);
    res.send(note);
  },
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema: getNoteSchema,
    auth: 'verified',
  },
);

const create = handleAsync(
  async ({ body, user: userId }, res) => {
    const createdNote = await noteService.create(body, userId as string);
    res.status(httpStatus.CREATED).send(createdNote);
  },
  {
    schema: createNoteSchema,
    auth: 'verified',
  },
);

const update = handleAsync(
  async ({ body, params: { noteId }, user: userId }, res) => {
    const updatedNote = await noteService.update(
      noteId,
      userId as string,
      body,
    );
    res.send(updatedNote);
  },
  {
    schema: updateNoteSchema,
    auth: 'verified',
  },
);

const destroy = handleAsync(
  async ({ params: { noteId }, user: userId }, res) => {
    await noteService.destroy(noteId, userId as string);
    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    schema: destroyNoteSchema,
    auth: 'verified',
  },
);

const findNoteCategory = handleAsync(
  async ({ params: { noteId }, user: userId }, res) => {
    const noteCategory = await noteService.findNoteCategory(
      noteId,
      userId as string,
    );
    if (!noteCategory) res.status(httpStatus.NO_CONTENT);
    res.send(noteCategory);
  },
  {
    schema: findNoteCategorySchema,
    auth: 'verified',
  },
);

const findNoteTags = handleAsync(
  async ({ params: { noteId }, user: userId }, res) => {
    const noteTags = await noteService.findNoteTags(noteId, userId as string);
    res.send(noteTags);
  },
  {
    schema: findNoteTagsSchema,
    auth: 'verified',
  },
);

export {
  create,
  destroy,
  findAll,
  findNoteCategory,
  findNoteTags,
  findOne,
  update,
};
