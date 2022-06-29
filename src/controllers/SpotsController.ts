import { Request, Response } from "express";
import { prisma } from "../database/prisma";
import { io } from "../server";
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

    console.log("spots", spots.length);
    return response.status(200).json(spots);
  }

  async create(request: Request, response: Response): Promise<Response> {
    const { latitude, longitude } = request.body;
    // @ts-ignore
    const userId = request.userId;
    let userIsAdmin = false;
    if (userId) {
      const userData = await prisma.user.findFirst({ where: { id: userId } });
      userIsAdmin = !!userData?.isAdmin;
    }

    const spot = await prisma.spot.create({
      data: {
        latitude,
        longitude,
        isAdmin: userIsAdmin,
        authorId: userId,
      },
    });

    io.emit("latestSpot", spot);
    return response.status(200).json({ spot });
  }

  async update(request: Request, response: Response): Promise<Response> {
    const { status, id } = request.body;
    const spot = await prisma.spot.update({
      where: { id },
      data: { status },
    });

    io.emit("latestSpot", spot);
    return response.status(200).json({ spot });
  }
}
