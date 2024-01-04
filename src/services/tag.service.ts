import { Prisma } from '@prisma/client';

import { BadRequestException, NotFoundException } from '$/exceptions';
import { prisma } from '$/lib';
import type { CreateTagBody, Pagination, UpdateTagBody } from '$/validations';

const findOne = async (tagId: string, authorId: string) => {
  const tag = await prisma.tag.findUnique({
    where: {
      id_authorId: {
        id: tagId,
        authorId,
      },
    },
    include: {
      _count: true,
    },
  });
  if (!tag) {
    throw new NotFoundException();
  }

  const { _count, ...rest } = tag;

  return { ...rest, count: _count.notes };
};

const findAll = async (authorId: string) => {
  const tags = await prisma.tag.findMany({
    where: {
      authorId,
    },
  });
  return tags;
};

const paginate = async (
  userId: string,
  { page, limit, search, sortBy }: Pagination,
) => {
  const where = {
    authorId: userId,
    ...(search && {
      name: search,
    }),
  };

  const orderBy =
    sortBy && ['name', 'createdAt', 'updatedAt'].includes(sortBy.by)
      ? {
          [sortBy.by]: sortBy.order,
        }
      : undefined;

  const [tags, totalTags] = await prisma.$transaction([
    prisma.tag.findMany({
      where,
      take: limit,
      skip: limit * (page - 1),
      include: {
        _count: true,
      },
      orderBy,
    }),
    prisma.tag.count({
      where,
    }),
  ]);
  const lastPage = Math.ceil(totalTags / limit);
  const info = {
    total: totalTags,
    current_page: page,
    next_page: page + 1 > lastPage ? null : page + 1,
    prev_page: page - 1 <= 0 ? null : page - 1,
    last_page: lastPage,
    per_page: limit,
  };
  return {
    info,
    data: tags.map(({ _count, ...category }) => ({
      ...category,
      count: _count.notes,
    })),
  };
};

const create = async ({ name }: CreateTagBody, authorId: string) => {
  try {
    const createdTag = await prisma.tag.create({
      data: {
        name,
        authorId,
      },
    });
    return createdTag;
  } catch (error) {
    // throw BadRequestException if the error is a unique constraint violation error (tag already exist)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(`tag with name '${name}' already exist`);
    }

    throw error;
  }
};
const update = async (
  tagId: string,
  authorId: string,
  { name }: UpdateTagBody,
) => {
  try {
    const updatedTag = await prisma.tag.update({
      where: {
        id_authorId: {
          id: tagId,
          authorId,
        },
      },
      data: {
        name,
      },
    });
    return updatedTag;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new NotFoundException();

      if (error.code === 'P2002')
        throw new BadRequestException(`tag with name '${name}' already exist`);
    }
    throw error;
  }
};

const destroy = async (tagId: string, authorId: string) => {
  try {
    await prisma.tag.delete({
      where: {
        id_authorId: {
          id: tagId,
          authorId,
        },
      },
    });
  } catch (error) {
    // record not found
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    )
      throw new NotFoundException();

    throw error;
  }
};

export { create, destroy, findAll, findOne, paginate, update };
