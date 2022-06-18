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

const getSpotsByPosition = async ({
  latitude,
  longitude,
  radius = 1000,
}: {
  latitude: number;
  longitude: number;
  radius?: number;
}) => {
  const limits = getBoundsOfDistance(
    {
      latitude: latitude as unknown as number,
      longitude: longitude as unknown as number,
    },
    radius
  );
  const spots = await prisma.spot.findMany({
    where: {
      AND: [
        { latitude: { gte: limits[0].latitude } },
        { latitude: { lte: limits[1].latitude } },
        { longitude: { gte: limits[0].longitude } },
        { longitude: { lte: limits[1].longitude } },
      ],
    },
  });
  return spots;
};

app.get("/spots", async (req: Request, res: Response) => {
  const { latitude, longitude } = req.query;
  const spots = await getSpotsByPosition({
    latitude: latitude as unknown as number,
    longitude: longitude as unknown as number,
  });
  console.log("spots", spots.length);
  res.send(spots);
});

app.post("/spots", async (req: Request, res: Response) => {
  const { latitude, longitude, position } = req.body;
  const result = await prisma.spot.create({
    data: {
      latitude,
      longitude,
    },
  });

  const spots = await getSpotsByPosition({
    latitude: position.latitude,
    longitude: position.longitude,
  });
  console.log("spots", spots.length);
  res.send(spots);
});

app.patch("/spots", async (req: Request, res: Response) => {
  const { status, id, position } = req.body;
  const result = await prisma.spot.update({ where: { id }, data: { status } });
  const spots = await getSpotsByPosition({
    latitude: position.latitude,
    longitude: position.longitude,
  });

  res.send(spots);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
