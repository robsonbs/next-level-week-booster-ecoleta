import express from 'express';
import multer from 'multer';
import { celebrate, Joi } from 'celebrate';

import ItemsController from './controllers/ItemsController';
import PointsController from './controllers/PointsController';

import multerConfig from './config/multer';

const routes = express.Router();
const upload = multer(multerConfig);

routes.get('/items', ItemsController.index);

routes.get('/points', PointsController.index);
routes.get('/points/:id', PointsController.show);
routes.post(
  '/points',
  upload.single('image'),
  celebrate(
    {
      body: Joi.object().keys({
        name: Joi.string().required(),
        email: Joi.string().email().required(),
        whatsapp: Joi.string().required(),
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        uf: Joi.string().max(2).required(),
        cidade: Joi.string().required(),
        items: Joi.string().required(),
      }),
    },
    { abortEarly: false },
  ),
  PointsController.create,
);

routes.get('/', (request, response) => {
  return response.json({ message: 'Hello World' });
});

export default routes;
