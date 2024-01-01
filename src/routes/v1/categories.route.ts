import { Router } from 'express';

import { categoryController } from '$/controllers';

const categoriesRouter = Router();

categoriesRouter
  .route('/')
  .get(categoryController.findAll)
  .post(categoryController.create);

categoriesRouter
  .route('/:categoryId')
  .get(categoryController.findOne)
  .patch(categoryController.update)
  .delete(categoryController.destroy);

categoriesRouter.get(
  '/:categoryId/notes',
  categoryController.findCategoryNotes,
);

export { categoriesRouter };

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management
 */

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create a category
 *     tags: [Categories]
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
 *               name: work
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *                $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *         default: 10
 *         description: Maximum number of categories
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
 *         description: search for categories
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
 *                        - $ref: '#/components/schemas/Category'
 *                        - type: object
 *                          properties:
 *                            count:
 *                              type: integer
 *                              description: number of notes in category
 *                              example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 */

/**
 * @swagger
 * /categories/{categoryId}:
 *   get:
 *     summary: Get a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category id
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                  - $ref: '#/components/schemas/Category'
 *                  - type: object
 *                    properties:
 *                      count:
 *                        type: integer
 *                        description: number of notes in category
 *                        example: 5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   patch:
 *     summary: Update a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category id
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
 *                $ref: '#/components/schemas/Category'
 *       400:
 *         $ref: '#/components/responses/ValidationFailed'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *
 *   delete:
 *     summary: Delete a category
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category id
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
 * /categories/{categoryId}/notes:
 *   get:
 *     summary: Get category's notes
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: Category id
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
 *             - tags
 *         description: include notes tags
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaginatedNotes'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
