import { ContextType } from ".."
import { userLoader } from "../daaLoaders/userLoaders"

export const Post = {
    author: async(parent: any, args: any, { prisma, userInfo }: ContextType) =>{
        // return await prisma.user.findUnique({
        //     where: {
        //         id: parent.authorId
        //     }
        // })
        return userLoader.load(parent.authorId)
    }
}