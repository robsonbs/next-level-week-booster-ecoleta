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
    const serializedPoints = points.map(point => ({
      ...point,
      image_url: `http://192.168.1.2:3333/uploads/points/${point.image}`,
    }));
    return response.json(serializedPoints);
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

    const serializedPoint = {
      ...point,
      image_url: `http://192.168.1.2:3333/uploads/points/${point.image}`,
    };
    return response.json(serializedPoint);
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
      items: poitsString,
    } = request.body;

    const trx = await knex.transaction();

    const [newPoint] = await trx('points').insert({
      image: request.file.filename,
      name,
      email,
      whatsapp,
      latitude,
      longitude,
      city,
      uf,
    });
    const items = poitsString
      .split(/ *, */g)
      .map((item: string) => Number(item));
    const pointItems = items.map((item_id: number) => ({
      point_id: newPoint,
      item_id,
    }));

    await trx('points_items').insert(pointItems);

    await trx.commit();

    const point = await knex('points').where('id', newPoint).first();

    return response.json(point);
  }
}

export default new PointsController();
