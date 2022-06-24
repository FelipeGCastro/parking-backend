import schedule from "node-schedule";
import { subMinutes } from "date-fns";
import { prisma } from "../database/prisma";
import { io } from "../server";

export function removeInvalidSpots() {
  const job = schedule.scheduleJob("*/1 * * * *", async function () {
    const spotsToRemove = await prisma.spot.findMany({
      where: {
        AND: [
          { status: "invalidated" },
          { updatedAt: { lte: subMinutes(new Date(), 2) } },
        ],
      },
    });
    if (spotsToRemove.length > 0) {
      const spotsRemoved = await prisma.spot.deleteMany({
        where: {
          AND: [
            { status: "invalidated" },
            { updatedAt: { lte: subMinutes(new Date(), 2) } },
          ],
        },
      });
      io.emit("removedSpots", spotsToRemove);
    }

    console.log("spotsRemoved", spotsToRemove);
  });
}
