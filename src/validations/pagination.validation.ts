import { z } from 'zod';

const paginationSchema = z.object({
  page: z
    .string()
    .transform((p) => {
      const page = parseInt(p, 10);
      return !Number.isNaN(page) && page > 0 ? page : 1;
    })
    .default('1'),
  limit: z
    .string()
    .transform((l) => {
      const limit = parseInt(l, 10);
      return !Number.isNaN(limit) && limit > 0 && limit <= 100 ? limit : 20;
    })
    .default('20'),
  sortBy: z
    .string()
    .transform((value) => {
      const [by, order] = value.split(',');

      return {
        by,
        order: ['asc', 'desc'].includes(order) ? order : 'asc',
      };
    })
    .optional(),
  search: z.string().optional(),
});

type Pagination = z.infer<typeof paginationSchema>;

export { Pagination, paginationSchema };
