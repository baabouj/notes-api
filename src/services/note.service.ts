import { Prisma } from '@prisma/client';

import { BadRequestException, NotFoundException } from '$/exceptions';
import { prisma } from '$/lib';
import type {
  CreateNoteBody,
  GetNotesQuery,
  NoteInclude,
  UpdateNoteBody,
} from '$/validations';

const findOne = async (
  noteId: string,
  authorId: string,
  include?: NoteInclude,
) => {
  const note = await prisma.note.findUnique({
    where: {
      id_authorId: {
        id: noteId,
        authorId,
      },
    },
    include,
  });
  if (!note) {
    throw new NotFoundException();
  }
  return note;
};

const paginate = async (
  userId: string,
  { page, limit, search, include }: GetNotesQuery,
  where = {} as Prisma.NoteWhereInput,
) => {
  const or = search
    ? {
        OR: [
          {
            title: {
              contains: search,
            },
          },
          {
            content: {
              contains: search,
            },
          },
        ],
      }
    : {};

  const [notes, totalNotes] = await prisma.$transaction([
    prisma.note.findMany({
      where: {
        authorId: userId,
        ...where,
        ...or,
      },
      take: limit,
      skip: limit * (page - 1),
      include,
    }),
    prisma.note.count({
      where: {
        authorId: userId,
        ...where,
        ...or,
      },
    }),
  ]);
  const lastPage = Math.ceil(totalNotes / limit);
  const info = {
    total: totalNotes,
    current_page: page,
    next_page: page + 1 > lastPage ? null : page + 1,
    prev_page: page - 1 <= 0 ? null : page - 1,
    last_page: lastPage,
    per_page: limit,
  };
  return { info, data: notes };
};

const create = async (
  { title, content, tags = [], categoryId }: CreateNoteBody,
  authorId: string,
) => {
  try {
    const createdNote = await prisma.note.create({
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
      include: {
        category: true,
        tags: true,
      },
    });
    return createdNote;
  } catch (error) {
    // throw BadRequestException if the error is a foreign key constraint error (categoryId doesn't exist)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new BadRequestException(
        `Category with id ${categoryId} doesn't exist`,
      );
    }

    throw error;
  }
};

const update = async (
  noteId: string,
  authorId: string,
  { title, content, tags = [], categoryId }: UpdateNoteBody,
) => {
  try {
    const updatedNote = await prisma.note.update({
      where: {
        id_authorId: {
          id: noteId,
          authorId,
        },
      },
      data: {
        title,
        content,
        categoryId,
        tags: {
          set: tags && [],
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
      include: {
        category: true,
        tags: true,
      },
    });

    return updatedNote;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // record not found
      if (error.code === 'P2025') throw new NotFoundException();

      // error is a foreign key constraint error (categoryId doesn't exist)
      if (error.code === 'P2003')
        throw new BadRequestException(
          `Category with id ${categoryId} doesn't exist`,
        );
    }

    throw error;
  }
};

const destroy = async (noteId: string, authorId: string) => {
  try {
    await prisma.note.delete({
      where: {
        id_authorId: {
          id: noteId,
          authorId,
        },
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
      throw new NotFoundException();

    throw error;
  }
};

const findNoteCategory = async (noteId: string, authorId: string) => {
  const note = await prisma.note.findUnique({
    where: {
      id_authorId: {
        id: noteId,
        authorId,
      },
    },
    include: {
      category: {
        include: {
          _count: true,
        },
      },
    },
  });

  if (!note) throw new NotFoundException();

  if (!note.category) return;

  const { _count, ...category } = note.category;

  return { ...category, count: _count.notes };
};

const findNoteTags = async (noteId: string, authorId: string) => {
  const note = await prisma.note.findUnique({
    where: {
      id_authorId: {
        id: noteId,
        authorId,
      },
    },
    include: {
      tags: true,
    },
  });

  if (!note) throw new NotFoundException();

  return note.tags;
};

export {
  create,
  destroy,
  findNoteCategory,
  findNoteTags,
  findOne,
  paginate,
  update,
};
