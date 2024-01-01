import httpStatus from 'http-status';

import { handleAsync } from '$/lib';
import { noteService, tagService } from '$/services';
import {
  createTagSchema,
  destroyTagSchema,
  getTagNotesSchema,
  getTagSchema,
  getTagsSchema,
  updateTagSchema,
} from '$/validations';

const findAll = handleAsync(
  async ({ query, user: userId }, res) => {
    const tags = await tagService.paginate(userId as string, query as any);
    res.send(tags);
  },
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema: getTagsSchema,
    auth: true,
  },
);

const findOne = handleAsync(
  async ({ params: { tagId }, user: userId }, res) => {
    const tag = await tagService.findOne(tagId, userId as string);
    res.send(tag);
  },
  {
    schema: getTagSchema,
    auth: true,
  },
);

const create = handleAsync(
  async ({ body, user: userId }, res) => {
    const createdTag = await tagService.create(body, userId as string);
    res.status(httpStatus.CREATED).send(createdTag);
  },
  {
    schema: createTagSchema,
    auth: true,
  },
);

const update = handleAsync(
  async ({ body, params: { tagId }, user: userId }, res) => {
    const updatedtag = await tagService.update(tagId, userId as string, body);
    res.send(updatedtag);
  },
  {
    schema: updateTagSchema,
    auth: true,
  },
);

const destroy = handleAsync(
  async ({ params: { tagId }, user: userId }, res) => {
    await tagService.destroy(tagId, userId as string);
    res.status(httpStatus.NO_CONTENT).send();
  },
  {
    schema: destroyTagSchema,
    auth: true,
  },
);

const findNotes = handleAsync(
  async ({ params: { tagId }, user: userId, query }, res) => {
    await tagService.findOne(tagId, userId as string);

    const tagNotes = await noteService.paginate(userId as string, query, {
      tags: {
        some: {
          id: tagId,
        },
      },
    });
    res.send(tagNotes);
  },
  {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    schema: getTagNotesSchema,
    auth: true,
  },
);

export { create, destroy, findAll, findNotes, findOne, update };
