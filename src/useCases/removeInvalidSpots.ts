import schedule from "node-schedule";
import { subMinutes } from "date-fns";
import { prisma } from "../database/prisma";

export function removeInvalidSpots() {
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
}
