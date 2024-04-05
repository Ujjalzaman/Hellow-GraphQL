import { ContextType } from ".."

export const Profile = {
    user: async(parent: any, args: any, { prisma }: ContextType) =>{
        return await prisma.user.findUnique({
            where: {
                id: parent.userId
            }
        })
    }
}