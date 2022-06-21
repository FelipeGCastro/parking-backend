import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { removeInvalidSpots } from "./useCases/removeInvalidSpots";
import routes from "./routes";
import { getSpotsByBounds } from "./useCases/getSpotsByBounds";
import { IBounds } from "./types";

async function main() {
  dotenv.config();

  const app: Express = express();
  const httpServer = createServer(app);
  const port = process.env.PORT;
  const io = new Server(httpServer, {});
  io.on("connection", (socket) => {
    socket.on("getSpots", async (bounds, callback) => {
      const spots = await getSpotsByBounds(bounds as unknown as IBounds);
      callback({
        spots,
      });
    });
  });
  app.use(express.json());

  removeInvalidSpots();
  app.use(routes);

  app.use(
    (
      error: Error,
      request: Request,
      response: Response,
      next: NextFunction
    ) => {
      return response.status(500).json({ message: error.message });
    }
  );
  httpServer.listen(port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
  });
}
main();
