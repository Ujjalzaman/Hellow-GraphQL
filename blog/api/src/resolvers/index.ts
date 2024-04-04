import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { jwtHelper } from "../utils/helper";
const prisma = new PrismaClient();

interface UserInfo {
    name: string,
    email: string,
    password: string,
    bio?: string
}

export const resolvers = {
    Query: {
        users: async (parent: any, args: any, context: any) => {
            return await prisma.user.findMany();
        }
    },
    Mutation: {
        signup: async (parent: any, args: UserInfo, context: any) => {
            const isUserExist = await prisma.user.findFirst({
                where: {
                    email: args.email
                }
            })
            if (isUserExist) {
                return {
                    userError: 'Already this email is exists!',
                    token: null
                }
            }
            const hashedPass = await bcrypt.hash(args.password, 12)

            const newUser = await prisma.user.create({
                data: {
                    name: args.name,
                    email: args.email,
                    password: hashedPass
                }
            });

            if (args.bio) {
                await prisma.profile.create({
                    data: {
                        bio: args.bio,
                        userId: newUser.id
                    }
                })
            }

            const token = await jwtHelper.generateToken({ userId: newUser.id });

            return {
                userError: null,
                token
            }
        }
    }
};