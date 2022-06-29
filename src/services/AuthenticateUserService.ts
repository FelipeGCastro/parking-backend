import axios from "axios";
import { sign } from "jsonwebtoken";
import { UserService } from "./UserService";

interface GoogleUserResponse {
  name: string;
  email: string;
  picture: string;
}

export const AuthenticateUserService = () => {
  const execute = async (token: string) => {
    const url = "https://www.googleapis.com/oauth2/v1/userinfo";
    try {
      const response = await axios.get<GoogleUserResponse>(url, {
        params: {
          alt: "json",
          access_token: token,
        },
        headers: {
          accept: "application/json",
        },
      });
      const { name, email, picture: avatarUrl } = response.data;

      const user = await UserService().createUser({ name, email, avatarUrl });

      const jwtoken = sign(
        {
          user: {
            id: user.id,
            name: user.name,
          },
        },
        String(process.env.JWT_SECRET),
        {
          subject: String(user.id),
          expiresIn: "1d",
        }
      );

      return { jwtoken, user };
    } catch (error) {
      console.log("error, AuthenticateUserService");
      throw error;
    }
  };
  return { execute };
};
