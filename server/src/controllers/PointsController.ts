import { Request, Response } from 'express';
import knex from '../database/connection';

interface ISearchParams {
  city?: string;
  uf?: string;
  items?: string;
}

class PointsController {
  async index(request: Request, response: Response): Promise<Response> {
    const { city, uf, items }: ISearchParams = request.query;
    const parsedItems = items?.split(/ *, */g).map(item => Number(item));

    let pQuery = knex('points').join(
      'points_items',
      'points.id',
      '=',
      'points_items.point_id',
    );

    if (city) {
      pQuery = pQuery.where('city', city);
    }

    if (uf) {
      pQuery = pQuery.where('uf', uf);
    }

    if (parsedItems) {
      pQuery = pQuery.whereIn('points_items.item_id', parsedItems);
    }

    const points = await pQuery.distinct().select('points.*');

    return response.json(points);
  }

  async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params;

    const point = await knex('points').where('id', id).first();

    if (!point) {
      return response.status(400).json({ message: 'Point not found.' });
    }

    const items = await knex('items')
      .join('points_items', 'items.id', '=', 'points_items.item_id')
      .where('points_items.point_id', id);
    point.items = items;

    return response.json(point);
  }

  async create(request: Request, response: Response): Promise<Response> {
    const {
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
      items,
    } = request.body;

    const trx = await knex.transaction();

    const [newPoint] = await trx('points').insert({
      image:
        'https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60',
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    });

    const pointItems = items.map((item_id: number) => ({
      point_id: newPoint,
      item_id,
    }));

    await trx('points_items').insert(pointItems);

    await trx.commit();

    return response.json({ success: true });
  }
}

export default new PointsController();
