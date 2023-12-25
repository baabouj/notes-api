import { faker } from '@faker-js/faker';
import cuid from 'cuid';

import { prisma } from '../../src/lib';
import type { Note } from './note.fixture';

export type Category = {
  id: string;
  name: string;
  authorId: string;
  notes?: Note[];
};

const generateCategory = (authorId: string): Category => {
  return {
    id: cuid(),
    name: faker.word.noun(),
    authorId,
  };
};

const insertCategories = async (categories: Category[]) => {
  const createdCategories = await Promise.all(
    categories.map(({ notes, ...category }) => {
      return prisma.category.create({
        data: {
          ...category,
          ...(notes && {
            notes: {
              create: notes.map((note) => ({
                ...note,
                tags: {
                  create: note.tags.map((tag) => ({
                    name: tag,
                    authorId: note.authorId,
                  })),
                },
              })),
            },
          }),
        },
      });
    }),
  );
  return createdCategories;
};

export { generateCategory, insertCategories };
