import { ContextType } from "../..";

export const Query = {
    me: async (parent: any, args: any, { prisma, userInfo }: ContextType) => {
        return await prisma.user.findUnique({
            where: {
                id: Number(userInfo?.userId)
            }
        });
    },
    profile: async (parent: any, args: any, { prisma, userInfo }: ContextType) => {
        return await prisma.profile.findUnique({
            where: {
                userId: Number(userInfo?.userId)
            }
        })
    },
    users: async (parent: any, args: any, { prisma }: ContextType) => {
        return await prisma.user.findMany();
    },
    posts: async (parent: any, args: any, { prisma }: ContextType) => {
        return await prisma.post.findMany({
            where: {
                published: true
            },
            orderBy: [
                {
                    createdAt: 'desc'
                }
            ]
        })
    }
}