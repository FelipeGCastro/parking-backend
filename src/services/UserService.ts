import { prisma } from "../database/prisma";

interface ICreateData {
  name: string;
  email: string;
  avatarUrl: string;
}
export const UserService = () => {
  const createUser = async (data: ICreateData) => {
    const { name, email, avatarUrl } = data;

    const checkUser = await prisma.user.findFirst({
      where: { email },
    });
    
    if (checkUser) {
      console.log('user exist')
      return checkUser;
    }

    const user = await prisma.user.create({ data: { avatarUrl, email, name } });

    return user;
  };
  return { createUser };
};
