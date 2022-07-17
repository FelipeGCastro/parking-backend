import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import { removeInvalidSpots } from "./useCases/removeInvalidSpots";
import routes from "./routes";
import { IBounds } from "./types";
import { getSpotsByBounds } from "./useCases/getSpotsByBounds";
import { AuthenticateMiddleware } from "./middlewares/AuthenticateMiddleware";

dotenv.config();

const app: Express = express();
const httpServer = createServer(app);
const port = process.env.PORT;
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  socket.on("getSpots", async (bounds, callback) => {
    const spots = await getSpotsByBounds(bounds as unknown as IBounds);
    callback({
      spots,
    });
  });
  socket.on("collaboratorLocation", async (location, userId) => {
    socket.broadcast.emit("collaboratorsLocation", location, userId);
  });
  socket.on("removeCollaborator", async (userId) => {
    socket.broadcast.emit("removeCollaborator", userId);
  });
});

removeInvalidSpots();

app.use(
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    if (req.originalUrl === "/webhooks") {
      next();
    } else {
      express.json()(req, res, next);
    }
  }
);

app.use(AuthenticateMiddleware().handle);
app.use(routes);

app.use(
  // @ts-ignore
  (error: Error, request: Request, response: Response, next: NextFunction) => {
    return response.status(500).json({ message: error.message });
  }
);
httpServer.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
export { app, io };
