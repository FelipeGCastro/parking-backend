import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { IBounds } from "../types";
import { getSpotsByBounds } from "../useCases/getSpotsByBounds";

export class SpotsController {
  async index(request: Request, response: Response): Promise<Response> {
    const { bounds } = request.query;

    const spots = await getSpotsByBounds(
      JSON.parse(bounds as string) as unknown as IBounds
    );
    // console.log("spots", spots.length);
    // res.send();

    return response.status(200).json(spots);
  }

  async create(request: Request, response: Response): Promise<Response> {
    const { latitude, longitude, bounds } = request.body;
    const result = await prisma.spot.create({
      data: {
        latitude,
        longitude,
      },
    });

    const spots = await getSpotsByBounds(bounds as unknown as IBounds);
    console.log("spots", spots.length);
    return response.status(200).json(spots);
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { status, id, bounds } = request.body;
    const result = await prisma.spot.update({
      where: { id },
      data: { status },
    });
    const spots = await getSpotsByBounds(bounds as unknown as IBounds);

    return response.status(200).json(spots);
  }
}
