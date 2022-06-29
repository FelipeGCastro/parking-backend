import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";

export const AuthenticateMiddleware = () => {
  const handle = async (
    request: Request,
    response: Response,
    next: NextFunction
  ) => {
    const authToken = request.headers.authorization;
    // WHEN WE WANT RESTRIC WITH TOKEN
    // if (!authToken) {
    //   return response.status(401).json({
    //     errorCode: "token.invalid",
    //   });
    // }
    if (authToken) {
      const [, token] = authToken.split(" ");

      try {
        const { sub } = verify(token, String(process.env.JWT_SECRET));

        const userId = sub;
        // @ts-ignore
        request.userId = userId;
      } catch (err) {
        console.log("No token");
        return response.status(401).json({ errorCode: "token.expired" });
      }
    }

    next();
  };
  return {
    handle,
  };
};
