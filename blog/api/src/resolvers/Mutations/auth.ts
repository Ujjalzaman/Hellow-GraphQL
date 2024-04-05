import bcrypt from "bcrypt";
import { jwtHelper } from "../../utils/helper";

interface UserInfo {
    name: string,
    email: string,
    password: string,
    bio?: string
}

export const authResolvers = {
    signup: async (parent: any, args: UserInfo, {prisma}: any) => {
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
    },

    signin: async (parent: any, args: any, {prisma}: any) => {
        const user = await prisma.user.findFirst({
            where: {
                email: args.email
            }
        })

        if (!user) {
            return {
                userError: "User not found",
                token: null
            }
        };

        const verifyPass = await bcrypt.compare(args.password, user.password);
        if (!verifyPass) {
            return {
                userError: "Password is not matched",
                token: null
            }
        };
        const token = await jwtHelper.generateToken({ userId: user.id });
        return {
            userError: null,
            token
        }
    },
}