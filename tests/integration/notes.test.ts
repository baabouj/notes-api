import httpStatus from 'http-status';
import pactum from 'pactum';

import { prisma } from '../../src/lib';
import { tokenService } from '../../src/services';
import { exclu } from '../../src/utils';
import {
  generateCategory,
  insertCategories,
} from '../fixtures/category.fixture';
import { generateNote, insertNotes } from '../fixtures/note.fixture';
import type { User } from '../fixtures/user.fixture';
import { generateUser, insertUsers } from '../fixtures/user.fixture';
import { setup } from '../utils/setup';

setup();
describe('Notes routes', () => {
  const user: User = generateUser();
  user.emailVerifiedAt = new Date();

  beforeAll(async () => {
    await insertUsers([user]);

    const accessToken = tokenService.generateJwt(user.id);
    pactum.request.setBaseUrl('http://localhost:4000/api');
    pactum.request.setBearerToken(accessToken);
  });

  describe('GET /v1/notes', () => {
    const notes = [{}, {}, {}, {}, {}].map(() => generateNote(user.id));

    test("should return 200 and return user's notes", async () => {
      await insertNotes(notes);

      await pactum
        .spec()
        .get('/v1/notes')
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
        })
        .expect((ctx) => {
          const { data } = ctx.res.body;
          expect(data).toBeDefined();
          expect(data).toHaveLength(notes.length);
        });
    });

    test('should return 401 error if token is invalid or missing', async () => {
      await pactum
        .spec()
        .get('/v1/notes')
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/notes')
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('POST /v1/notes', () => {
    test('should return 201 and return created note', async () => {
      const note = exclu(generateNote(user.id), ['id']);

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          title: note.title,
          content: note.content,
        })
        .expectStatus(httpStatus.CREATED)
        .expectJsonLike(note);
    });

    test('should return 201 and return created note with tags', async () => {
      const note = exclu(generateNote(user.id), ['id']);

      const tags = ['tag1', 'tag2'];

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          title: note.title,
          content: note.content,
          tags,
        })
        .expectStatus(httpStatus.CREATED)
        .expectJsonLike({
          ...note,
          tags: tags.map((tag) => ({ name: tag, authorId: user.id })),
        });
    });

    test('should return 201 and return created note with category', async () => {
      const note = exclu(generateNote(user.id), ['id']);

      const [category] = await insertCategories([generateCategory(user.id)]);

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          title: note.title,
          content: note.content,
          categoryId: category.id,
        })
        .expectStatus(httpStatus.CREATED)
        .expectJsonLike({
          ...note,
          category: exclu(category, ['createdAt', 'updatedAt']),
        });
    });

    test('should return 400 if title or content is missing', async () => {
      const note = exclu(generateNote(user.id), ['id']);

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          content: note.content,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('title is required');

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          title: note.title,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('content is required');

      await pactum
        .spec()
        .post('/v1/notes')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('title is required')
        .expectBodyContains('content is required');
    });

    test('should return 400 if tags are more than 4', async () => {
      const note = exclu(generateNote(user.id), ['id']);

      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          title: note.title,
          content: note.content,
          tags,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains("a note can't have more than 4 tages");
    });

    test("should return 400 if category doesn't exist", async () => {
      const note = exclu(generateNote(user.id), ['id']);

      const category = generateCategory(user.id);

      await pactum
        .spec()
        .post('/v1/notes')
        .withBody({
          title: note.title,
          content: note.content,
          categoryId: category.id,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectJsonLike({
          message: `Category with id ${category.id} doesn't exist`,
        });
    });

    test('should return 401 error if token is invalid or missing', async () => {
      await pactum
        .spec()
        .get('/v1/notes')
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/notes')
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/notes/:noteId', () => {
    test('should return 200 and return note', async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.OK)
        .expectJsonLike(exclu(note, ['createdAt', 'updatedAt']));
    });

    test("should return 404 if note doesn't exist", async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if note doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUserNote] = await insertNotes([generateNote(otherUser.id)]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}')
        .withPathParams('noteId', otherUserNote.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if noteId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/notes/{noteId}')
        .withPathParams('noteId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('PATCH /v1/notes/:noteId', () => {
    test('should return 200 and update note', async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      const newTitle = 'new title';
      const newcontent = 'new content';

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withBody({
          title: newTitle,
          content: newcontent,
        })
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          ...exclu(note, ['createdAt', 'updatedAt']),
          title: newTitle,
          content: newcontent,
        });
    });

    test("should return 200 and update note's tags", async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      const tags = ['tag1', 'tag2'];

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withBody({
          tags,
        })
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          ...exclu(note, ['createdAt', 'updatedAt']),
          tags: tags.map((tag) => ({ name: tag, authorId: user.id })),
        });
    });

    test("should return 200 and update note's category", async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      const [category] = await insertCategories([generateCategory(user.id)]);

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withBody({
          categoryId: category.id,
        })
        .expectStatus(httpStatus.OK)
        .expectJsonLike({
          ...exclu(note, ['createdAt', 'updatedAt']),
          categoryId: category.id,
          category: exclu(category, ['createdAt', 'updatedAt']),
        });
    });

    test("should return 404 if note doesn't exist", async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if note doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUserNote] = await insertNotes([generateNote(otherUser.id)]);

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', otherUserNote.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 400 if category doesn't exist", async () => {
      const [note] = await insertNotes([generateNote(user.id)]);
      const category = generateCategory(user.id);

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withBody({
          title: note.title,
          content: note.content,
          categoryId: category.id,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectJsonLike({
          message: `Category with id ${category.id} doesn't exist`,
        });
    });

    test('should return 400 if noteId is not a valid cuid', async () => {
      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 400 if tags are more than 4', async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      const tags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5'];

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withBody({
          tags,
        })
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains("a note can't have more than 4 tages");
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .patch('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('DELETE /v1/notes/:noteId', () => {
    test('should return 204 and delete note', async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      await pactum
        .spec()
        .delete('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NO_CONTENT);

      const deletedNote = await prisma.note.findUnique({
        where: {
          id_authorId: {
            id: note.id,
            authorId: note.authorId,
          },
        },
      });
      expect(deletedNote).toBeNull();
    });

    test("should return 404 if note doesn't exist", async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .delete('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if note doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUserNote] = await insertNotes([generateNote(otherUser.id)]);

      await pactum
        .spec()
        .delete('/v1/notes/{noteId}')
        .withPathParams('noteId', otherUserNote.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if noteId is not a valid cuid', async () => {
      await pactum
        .spec()
        .delete('/v1/notes/{noteId}')
        .withPathParams('noteId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .delete('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .delete('/v1/notes/{noteId}')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/notes/:noteId/category', () => {
    test("should return 200 and return note's category", async () => {
      const [category] = await insertCategories([generateCategory(user.id)]);

      const [note] = await insertNotes([
        { ...generateNote(user.id), categoryId: category.id },
      ]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.OK)
        .expectJsonLike(exclu(category, ['createdAt', 'updatedAt']));
    });

    test("should return 204 if note doesn't have a category", async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NO_CONTENT);
    });

    test("should return 404 if note doesn't exist", async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if note doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUserNote] = await insertNotes([generateNote(otherUser.id)]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', otherUserNote.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if noteId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/notes/{noteId}/category')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });

  describe('GET /v1/notes/:noteId/tags', () => {
    test("should return 200 and return note's category", async () => {
      const tags = ['tag1', 'tag2'];

      const [note] = await insertNotes([{ ...generateNote(user.id), tags }]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.OK)
        .expectJsonLike(tags.map((tag) => ({ name: tag, authorId: user.id })));
    });

    test("should return 200 and empty array if note doesn't have tags", async () => {
      const [note] = await insertNotes([generateNote(user.id)]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.OK)
        .expectJson([]);
    });

    test("should return 404 if note doesn't exist", async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', note.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test("should return 404 if note doesn't belong to user", async () => {
      const [otherUser] = await insertUsers([generateUser()]);
      const [otherUserNote] = await insertNotes([generateNote(otherUser.id)]);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', otherUserNote.id)
        .expectStatus(httpStatus.NOT_FOUND);
    });

    test('should return 400 if noteId is not a valid cuid', async () => {
      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', 'invalidcuid')
        .expectStatus(httpStatus.BAD_REQUEST)
        .expectBodyContains('cuid');
    });

    test('should return 401 error if token is invalid or missing', async () => {
      const note = generateNote(user.id);

      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', 'invalidtoken')
        .expectStatus(httpStatus.UNAUTHORIZED);
      await pactum
        .spec()
        .get('/v1/notes/{noteId}/tags')
        .withPathParams('noteId', note.id)
        .withHeaders('Authorization', '')
        .expectStatus(httpStatus.UNAUTHORIZED);
    });
  });
});

describe('Notes routes', () => {
  test.todo('notes routes');
});
