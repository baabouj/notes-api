import { Router } from 'express';

import { tagController } from '$/controllers';

const tagsRouter = Router();

tagsRouter.route('/').get(tagController.findAll).post(tagController.create);

tagsRouter
  .route('/:tagId')
  .get(tagController.findOne)
  .patch(tagController.update)
  .delete(tagController.destroy);

tagsRouter.get('/:tagId/notes', tagController.findNotes);

export { tagsRouter };

/**
 * @swagger
 * tags:
 *   name: Tags
 *   description: Tag management
 */

/**
 * @swagger
 * /tags:
 *   post:
 *     summary: Create a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *             example:
 *               name: javascript
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of tags
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
 *         description: search for tags
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum:
 *             - name
 *             - createdAt
 *             - updatedAt
 *             - name,asc
 *             - name,desc
 *             - createdAt,asc
 *             - createdAt,desc
 *             - updatedAt,asc
 *             - updatedAt,desc
 *         description: sort tags by a field and in asc or desc order
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 info:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     current_page:
 *                       type: integer
 *                       example: 2
 *                     next_page:
 *                       type: integer
 *                       example: 3
 *                     prev_page:
 *                       type: integer
 *                       example: 1
 *                     last_page:
 *                       type: integer
 *                       example: 4
 *                     per_page:
 *                       type: integer
 *                       example: 20
 *                 data:
 *                   type: array
 *                   items:
 *                     allOf:
 *                        - $ref: '#/components/schemas/Tag'
 *                        - type: object
 *                          properties:
 *                            count:
 *                              type: integer
 *                              description: number of notes in tag
 *                              example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 */

/**
 * @swagger
 * /tags/{tagId}:
 *   get:
 *     summary: Get a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                  - $ref: '#/components/schemas/Tag'
 *                  - type: object
 *                    properties:
 *                      count:
 *                        type: integer
 *                        description: number of notes in tag
 *                        example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: work
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Tag'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
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
 * /tags/{tagId}/notes:
 *   get:
 *     summary: Get tag's notes
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tagId
 *         required: true
 *         schema:
 *           type: string
 *         description: Tag id
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
