import { Prisma } from '@prisma/client';

import { BadRequestException, NotFoundException } from '$/exceptions';
import { prisma } from '$/lib';
import type {
  CreateCategoryBody,
  Pagination,
  UpdateCategoryBody,
} from '$/validations';

const findAll = async (authorId: string) => {
  const categories = await prisma.category.findMany({
    where: {
      authorId,
    },
    include: {
      _count: true,
    },
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    count: _count.notes,
  }));
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

  const [categories, totalCategories] = await prisma.$transaction([
    prisma.category.findMany({
      where,
      take: limit,
      skip: limit * (page - 1),
      include: {
        _count: true,
      },
      orderBy,
    }),
    prisma.category.count({
      where,
    }),
  ]);
  const lastPage = Math.ceil(totalCategories / limit);
  const info = {
    total: totalCategories,
    current_page: page,
    next_page: page + 1 > lastPage ? null : page + 1,
    prev_page: page - 1 <= 0 ? null : page - 1,
    last_page: lastPage,
    per_page: limit,
  };
  return {
    info,
    data: categories.map(({ _count, ...category }) => ({
      ...category,
      count: _count.notes,
    })),
  };
};

const findOne = async (categoryId: string, authorId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id_authorId: {
        id: categoryId,
        authorId,
      },
    },
    include: {
      _count: true,
    },
  });
  if (!category) {
    throw new NotFoundException();
  }
  const { _count, ...rest } = category;

  return { ...rest, count: _count.notes };
};

const create = async ({ name }: CreateCategoryBody, authorId: string) => {
  try {
    return await prisma.category.create({
      data: {
        name,
        authorId,
      },
    });
  } catch (error) {
    // the error is a unique constraint violation error (category already exist)
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new BadRequestException(
        `category with name '${name}' already exist`,
      );
    }

    throw error;
  }
};

const update = async (
  categoryId: string,
  authorId: string,
  { name }: UpdateCategoryBody,
) => {
  try {
    const updatedCategory = await prisma.category.update({
      where: {
        id_authorId: {
          id: categoryId,
          authorId,
        },
      },
      data: {
        name,
      },
    });

    return updatedCategory;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') throw new NotFoundException();

      if (error.code === 'P2002')
        throw new BadRequestException(
          `category with name '${name}' already exist`,
        );
    }
    throw error;
  }
};

const destroy = async (categoryId: string, authorId: string) => {
  try {
    await prisma.category.delete({
      where: {
        id_authorId: {
          id: categoryId,
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

const findNotes = async (categoryId: string, authorId: string) => {
  const category = await prisma.category.findUnique({
    where: {
      id_authorId: {
        id: categoryId,
        authorId,
      },
    },
    include: {
      notes: true,
    },
  });

  if (!category) throw new NotFoundException();

  return category.notes;
};

export { create, destroy, findAll, findNotes, findOne, paginate, update };
