import { faker } from '@faker-js/faker';
import cuid from 'cuid';

import { prisma } from '../../src/lib';
import type { Note } from './note.fixture';

export type Tag = {
  id: string;
  name: string;
  authorId: string;
  notes?: Note[];
};

const generateTag = (authorId: string): Tag => {
  return {
    id: cuid(),
    name: faker.word.noun(),
    authorId,
  };
};

const insertTags = async (tags: Tag[]) => {
  const createdTags = await Promise.all(
    tags.map(({ notes, ...tag }) => {
      return prisma.tag.create({
        data: {
          ...tag,
          ...(notes && {
            notes: {
              create: notes,
            },
          }),
        },
      });
    }),
  );
  return createdTags;
};

export { generateTag, insertTags };
