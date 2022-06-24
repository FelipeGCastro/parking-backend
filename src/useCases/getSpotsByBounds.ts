import { prisma } from "../database/prisma";
import { IBounds } from "../types";

export const getSpotsByBounds = async ({ northEast, southWest }: IBounds) => {
  const spots = await prisma.spot.findMany({
    where: {
      AND: [
        { latitude: { gte: southWest.latitude } },
        { latitude: { lte: northEast.latitude } },
        { longitude: { gte: southWest.longitude } },
        { longitude: { lte: northEast.longitude } },
        { status: { not: "disabled" } },
      ],
    },
  });
  return spots;
};
