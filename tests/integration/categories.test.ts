import httpStatus from 'http-status';
import pactum from 'pactum';

import { prisma } from '$/lib';
import { tokenService } from '$/services';
import { exclu } from '$/utils';

import {
  generateCategory,
  insertCategories,
} from '../fixtures/category.fixture';
import { generateNote } from '../fixtures/note.fixture';
import { generateUser, insertUsers } from '../fixtures/user.fixture';
import { setup } from '../utils/setup';

setup();
describe('Categories routes', () => {
  const user = generateUser();
  user.emailVerifiedAt = new Date();

  beforeAll(async () => {
    await insertUsers([user]);

    const accessToken = tokenService.generateJwt(user.id);
    pactum.request.setBaseUrl('http://localhost:4000/api');
    pactum.request.setBearerToken(accessToken);
  });

  describe('GET /v1/categories', () => {
    test("should return 200 and return user's categories", async () => {
      const categories = await insertCategories([
        generateCategory(user.id),
        generateCategory(user.id),
        generateCategory(user.id),
        generateCategory(user.id),
        generateCategory(user.id),
      ]);

      await pactum
        .spec()
        .get('/v1/categories')
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          info: {
            total: categories.length,
            current_page: 1,
            next_page: null,
            prev_page: null,
            last_page: 1,
            per_page: 20,
          },
          data: categories.map(({ id, name, authorId }) => ({
            id,
            name,
            authorId,
          })),
        })
        .expect((ctx) => {
          const { data } = ctx.res.body;
          expect(data).toBeDefined();
          expect(data).toHaveLength(categories.length);
        });
    });

    test('should return 401 error if token is invalid or missing', async () => {
      await pactum
        .spec()
        .get('/v1/categories')
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/categories')
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/categories', () => {
    test('should return 201 and return created category', async () => {
      const category = exclu(generateCategory(user.id), ['id']);

      await pactum
        .spec()
        .post('/v1/categories')
        .withBody({ name: category.name })
        .expectStatus(httpStatus.CREATED)
        .expectJsonLike(category);
    });

    test('should return 400 if name is missing', async () => {
      await pactum
        .spec()
        .post('/v1/categories')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('category name is required');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      await pactum
        .spec()
        .get('/v1/categories')
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/categories')
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/categories/:categoryId', () => {
    test('should return 200 and return category', async () => {
      const [category] = await insertCategories([generateCategory(user.id)]);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.OK)
        .expectJsonLike(exclu(category, ['createdAt', 'updatedAt']));
    });

    test("should return 404 if category doesn't exist", async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if category doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsercategory] = await insertCategories([
        generateCategory(otherUser.id),
      ]);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}')
        .withPathParams('categoryId', otherUsercategory.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if categoryId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/categories/{categoryId}')
        .withPathParams('categoryId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/categories/:categoryId', () => {
    test('should return 200 and update category', async () => {
      const [category] = await insertCategories([generateCategory(user.id)]);

      const name = 'travel';

      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withBody({
          name,
        })
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          ...exclu(category, ['createdAt', 'updatedAt']),
          name,
        });
    });
    test('should return 400 if tag name already exist', async () => {
      const [category, otherCategory] = await insertCategories([
        generateCategory(user.id),
        generateCategory(user.id),
      ]);

      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withBody({
          name: otherCategory.name,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains(
          `category with name '${otherCategory.name}' already exist`,
        );
    });

    test("should return 404 if category doesn't exist", async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if category doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsercategory] = await insertCategories([
        generateCategory(otherUser.id),
      ]);

      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', otherUsercategory.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if categoryId is not a valid cuid', async () => {
      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .patch('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /v1/categories/:categoryId', () => {
    test('should return 204 and delete category', async () => {
      const [category] = await insertCategories([generateCategory(user.id)]);

      await pactum
        .spec()
        .delete('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.NO_CONTENT);

      const deletedcategory = await prisma.category.findUnique({
        where: {
          id_authorId: {
            id: category.id,
            authorId: user.id,
          },
        },
      });
      expect(deletedcategory).toBeNull();
    });

    test("should return 404 if category doesn't exist", async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .delete('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if category doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsercategory] = await insertCategories([
        generateCategory(otherUser.id),
      ]);

      await pactum
        .spec()
        .delete('/v1/categories/{categoryId}')
        .withPathParams('categoryId', otherUsercategory.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if categoryId is not a valid cuid', async () => {
      await pactum
        .spec()
        .delete('/v1/categories/{categoryId}')
        .withPathParams('categoryId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .delete('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .delete('/v1/categories/{categoryId}')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/categories/:categoryId/notes', () => {
    test("should return 200 and return category's notes", async () => {
      const notes = [
        generateNote(user.id),
        generateNote(user.id),
        generateNote(user.id),
        generateNote(user.id),
        generateNote(user.id),
      ];
      const [category] = await insertCategories([
        { ...generateCategory(user.id), notes },
      ]);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          info: {
            total: notes.length,
            current_page: 1,
            next_page: null,
            prev_page: null,
            last_page: 1,
            per_page: 20,
          },
          data: notes.map(({ title, content, authorId }) => ({
            title,
            content,
            authorId,
          })),
        })
        .expect((ctx) => {
          const { data } = ctx.res.body;
          expect(data).toBeDefined();
          expect(data).toHaveLength(notes.length);
        });
    });

    test("should return 200 and empty data array if category doesn't have notes", async () => {
      const [category] = await insertCategories([generateCategory(user.id)]);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.OK)
        .expectJson({
          info: {
            total: 0,
            current_page: 1,
            next_page: null,
            prev_page: null,
            last_page: 0,
            per_page: 20,
          },
          data: [],
        });
    });

    test("should return 404 if category doesn't exist", async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', category.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if category doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsercategory] = await insertCategories([
        generateCategory(otherUser.id),
      ]);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', otherUsercategory.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if categoryId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/categories/{categoryId}/notes')
        .withPathParams('categoryId', category.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });
});
