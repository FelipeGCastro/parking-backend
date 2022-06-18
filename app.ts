import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { Prisma, PrismaClient } from "@prisma/client";
import { getBoundsOfDistance } from "geolib";
import schedule from "node-schedule";
import { subMinutes } from "date-fns";

const prisma = new PrismaClient();

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
app.use(express.json());

const job = schedule.scheduleJob("*/1 * * * *", async function () {
  const spotsRemoved = await prisma.spot.deleteMany({
    where: {
      AND: [
        { status: "invalidated" },
        { updatedAt: { lte: subMinutes(new Date(), 2) } },
      ],
    },
  });
  console.log("spotsRemoved", spotsRemoved);
});

interface IBounds {
  northEast: { latitude: number; longitude: number };
  southWest: { latitude: number; longitude: number };
}

const getSpotsByBounds = async ({ northEast, southWest }: IBounds) => {
  const spots = await prisma.spot.findMany({
    where: {
      AND: [
        { latitude: { gte: southWest.latitude } },
        { latitude: { lte: northEast.latitude } },
        { longitude: { gte: southWest.longitude } },
        { longitude: { lte: northEast.longitude } },
      ],
    },
  });
  return spots;
};

app.get("/spots", async (req: Request, res: Response) => {
  const { bounds } = req.query;

  const spots = await getSpotsByBounds(
    JSON.parse(bounds as string) as unknown as IBounds
  );
  console.log("spots", spots.length);
  res.send(spots);
});

app.post("/spots", async (req: Request, res: Response) => {
  const { latitude, longitude, bounds } = req.body;
  const result = await prisma.spot.create({
    data: {
      latitude,
      longitude,
    },
  });

  const spots = await getSpotsByBounds(bounds as unknown as IBounds);
  console.log("spots", spots.length);
  res.send(spots);
});

app.patch("/spots", async (req: Request, res: Response) => {
  const { status, id, bounds } = req.body;
  const result = await prisma.spot.update({ where: { id }, data: { status } });
  const spots = await getSpotsByBounds(bounds as unknown as IBounds);

  res.send(spots);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
