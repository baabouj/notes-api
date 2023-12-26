import httpStatus from 'http-status';
import pactum from 'pactum';

import { prisma } from '$/lib';
import { tokenService } from '$/services';
import { exclu } from '$/utils';

import { generateNote, type Note } from '../fixtures/note.fixture';
import { generateTag, insertTags } from '../fixtures/tag.fixture';
import type { User } from '../fixtures/user.fixture';
import { generateUser, insertUsers } from '../fixtures/user.fixture';
import { setup } from '../utils/setup';

setup();
describe('Tags routes', () => {
  const user: User = generateUser();
  user.emailVerifiedAt = new Date();

  beforeAll(async () => {
    await insertUsers([user]);

    const accessToken = tokenService.generateJwt(user.id);
    pactum.request.setBaseUrl('http://localhost:4000/api');
    pactum.request.setBearerToken(accessToken);
  });

  describe('GET /v1/tags', () => {
    test("should return 200 and return user's tags", async () => {
      const tags = await insertTags([
        generateTag(user.id),
        generateTag(user.id),
        generateTag(user.id),
        generateTag(user.id),
        generateTag(user.id),
      ]);

      await pactum
        .spec()
        .get('/v1/tags')
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          info: {
            total: tags.length,
            current_page: 1,
            next_page: null,
            prev_page: null,
            last_page: 1,
            per_page: 20,
          },
          data: tags.map(({ id, name, authorId }) => ({ id, name, authorId })),
        })
        .expect((ctx) => {
          const { data } = ctx.res.body;
          expect(data).toBeDefined();
          expect(data).toHaveLength(tags.length);
        });
    });

    test('should return 401 error if token is invalid or missing', async () => {
      await pactum
        .spec()
        .get('/v1/tags')
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/tags')
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/tags', () => {
    test('should return 201 and return created tag', async () => {
      const tag = exclu(generateTag(user.id), ['id']);

      await pactum
        .spec()
        .post('/v1/tags')
        .withBody({ name: tag.name })
        .expectStatus(httpStatus.CREATED)
        .expectJsonLike(tag);
    });

    test('should return 400 if name is missing', async () => {
      await pactum
        .spec()
        .post('/v1/tags')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('tag name is required');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      await pactum
        .spec()
        .get('/v1/tags')
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/tags')
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/tags/:tagId', () => {
    test('should return 200 and return tag', async () => {
      const [tag] = await insertTags([generateTag(user.id)]);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .expectStatus(httpStatus.OK)
        .expectJsonLike(exclu(tag, ['createdAt', 'updatedAt']));
    });

    test("should return 404 if tag doesn't exist", async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if tag doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsertag] = await insertTags([generateTag(otherUser.id)]);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}')
        .withPathParams('tagId', otherUsertag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if tagId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/tags/{tagId}')
        .withPathParams('tagId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/tags/:tagId', () => {
    test('should return 200 and update tag', async () => {
      const [tag] = await insertTags([generateTag(user.id)]);

      const name = 'travel';

      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withBody({
          name,
        })
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          ...exclu(tag, ['createdAt', 'updatedAt']),
          name,
        });
    });

    test('should return 400 if tag name already exist', async () => {
      const [tag, otherTag] = await insertTags([
        generateTag(user.id),
        generateTag(user.id),
      ]);

      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withBody({
          name: otherTag.name,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains(`tag with name '${otherTag.name}' already exist`);
    });

    test("should return 404 if tag doesn't exist", async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if tag doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsertag] = await insertTags([generateTag(otherUser.id)]);

      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', otherUsertag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if tagId is not a valid cuid', async () => {
      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .patch('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /v1/tags/:tagId', () => {
    test('should return 204 and delete tag', async () => {
      const [tag] = await insertTags([generateTag(user.id)]);

      await pactum
        .spec()
        .delete('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .expectStatus(httpStatus.NO_CONTENT);

      const deletedTag = await prisma.tag.findUnique({
        where: {
          id_authorId: {
            id: tag.id,
            authorId: user.id,
          },
        },
      });
      expect(deletedTag).toBeNull();
    });

    test("should return 404 if tag doesn't exist", async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .delete('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if tag doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsertag] = await insertTags([generateTag(otherUser.id)]);

      await pactum
        .spec()
        .delete('/v1/tags/{tagId}')
        .withPathParams('tagId', otherUsertag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if tagId is not a valid cuid', async () => {
      await pactum
        .spec()
        .delete('/v1/tags/{tagId}')
        .withPathParams('tagId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .delete('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .delete('/v1/tags/{tagId}')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/tags/:tagId/notes', () => {
    test("should return 200 and return tag's notes", async () => {
      const notes = Array.from({
        length: 5,
      }).map(() => exclu(generateNote(user.id), ['tags']) as Note);

      const [tag] = await insertTags([{ ...generateTag(user.id), notes }]);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', tag.id)
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

    test("should return 200 and empty data array if tag doesn't have notes", async () => {
      const [tag] = await insertTags([generateTag(user.id)]);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', tag.id)
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

    test("should return 404 if tag doesn't exist", async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', tag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if tag doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUsertag] = await insertTags([generateTag(otherUser.id)]);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', otherUsertag.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if tagId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const tag = generateTag(user.id);

      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/tags/{tagId}/notes')
        .withPathParams('tagId', tag.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });
});
