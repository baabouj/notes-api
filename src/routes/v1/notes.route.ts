import { Router } from 'express';

import { noteController } from '$/controllers';

const notesRouter = Router();

notesRouter.route('/').get(noteController.findAll).post(noteController.create);

notesRouter
  .route('/:noteId')
  .get(noteController.findOne)
  .patch(noteController.update)
  .delete(noteController.destroy);

notesRouter.get('/:noteId/category', noteController.findNoteCategory);
notesRouter.get('/:noteId/tags', noteController.findNoteTags);

export { notesRouter };

/**
 * @swagger
 * tags:
 *   name: Notes
 *   description: Note management
 */

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *        $ref: '#/components/requestBody/Note'
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Note'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all notes
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of notes
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: search for notes
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *           enum:
 *             - category
 *             - tags
 *             - tags,category
 *             - category,tags
 *         description: include notes tags or categories or both
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - title
 *             - content
 *             - createdAt
 *             - updatedAt
 *             - title,asc
 *             - title,desc
 *             - content,asc
 *             - content,desc
 *             - createdAt,asc
 *             - createdAt,desc
 *             - updatedAt,asc
 *             - updatedAt,desc
 *         description: sort notes by a field and in asc or desc order
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaginatedNotes'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 */

/**
 * @swagger
 * /notes/{noteId}:
 *   get:
 *     summary: Get a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note id
 *       - in: query
 *         name: include
 *         schema:
 *           type: string
 *           enum:
 *             - category
 *             - tags
 *             - tags,category
 *             - category,tags
 *         description: include notes tags or categories or both
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Note'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note id
 *     requestBody:
 *        $ref: '#/components/requestBody/Note'
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Note'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note id
 *     responses:
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

/**
 * @swagger
 * /notes/{noteId}/category:
 *   get:
 *     summary: Get note's category
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                allOf:
 *                  - $ref: '#/components/schemas/Category'
 *                  - type: object
 *                    properties:
 *                      count:
 *                        type: integer
 *                        description: number of notes in category
 *                        example: 5
 *       204:
 *         description: No Content
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /notes/{noteId}/tags:
 *   get:
 *     summary: Get note's tags
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: noteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Note id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                type: array
 *                items:
 *                  $ref: '#/components/schemas/Tag'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
