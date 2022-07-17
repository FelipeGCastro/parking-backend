import { Request, Response } from "express";
import { AuthenticateUserService } from "../services/AuthenticateUserService";
export class AuthenticateController {
  public async handle(request: Request, response: Response): Promise<Response> {
    const { token } = request.body;

    try {
      const { jwtoken, user } = await AuthenticateUserService().execute(token);

      return response.status(200).json({ token: jwtoken, user });
    } catch (error) {
      console.log("error", error);
      return response.status(401).json({ error });
    }
  }
}
