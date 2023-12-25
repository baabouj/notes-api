import { faker } from '@faker-js/faker';
import cuid from 'cuid';

import { prisma } from '../../src/lib';

export type Note = {
  id: string;
  title: string;
  content: string;
  authorId: string;
  categoryId?: string;
  tags: string[];
};
const generateNote = (authorId: string): Note => {
  return {
    id: cuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraph(),
    authorId,
    tags: [],
  };
};

const insertNotes = async (notes: Note[]) => {
  const createdNotes = await Promise.all(
    notes.map(({ title, content, authorId, categoryId, tags }) => {
      return prisma.note.create({
        data: {
          title,
          content,
          authorId,
          categoryId,
          tags: {
            connectOrCreate: tags?.map((tag) => ({
              where: {
                name_authorId: {
                  name: tag,
                  authorId,
                },
              },
              create: { name: tag, authorId },
            })),
          },
        },
      });
    }),
  );
  return createdNotes;
};

export { generateNote, insertNotes };
