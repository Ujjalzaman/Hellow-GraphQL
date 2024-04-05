import { Prisma, PrismaClient } from "@prisma/client";
import { DefaultArgs } from "@prisma/client/runtime/library";
import { ContextType } from "..";

export const checkUserAccess = async(prisma: ContextType['prisma'], userId: any, postId: any) =>{

    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    })
    console.log(user)

    if(!user){
        return {
            userError: 'User not found !',
            post: null
        }
    };

    const post = await prisma.post.findUnique({
        where: {
            id: Number(postId)
        }
    })

    if(!post){
        return {
            userError: 'Post not found !',
            post: null
        }
    };

    if(post.authorId !== user.id){
        return {
            userError: "Post not owned by User!",
            post: null
        }
    };
    return false;
}