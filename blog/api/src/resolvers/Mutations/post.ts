import { ContextType } from "../.."
import { checkUserAccess } from "../../utils/checkUserAccess";

export const postResolvers = {
    addPost: async (parent: any, { post }: any, { prisma, userInfo }: ContextType) => {
        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            }
        };

        if (!post.title || !post.content) {
            return {
                userError: "Title and content is required",
                post: null
            }
        };

        const newPost = await prisma.post.create({
            data: {
                title: post.title,
                content: post.content,
                authorId: Number(userInfo.userId)
            }
        });

        return {
            userError: null,
            post: newPost
        }
    },

    updatePost: async (parent: any, args: any, {prisma, userInfo}:ContextType) => {

        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            }
        };

        const isUserAccess = await checkUserAccess(prisma, userInfo.userId, args.postId)

        if(isUserAccess){
            return isUserAccess;
        }

        const updatePost = await prisma.post.update({
            where: {
                id: Number(args.postId)
            },
            data: args.post
        })
        return {
            userError: null,
            post: updatePost
        }

    },

    deletePost: async (parent: any, args: any, {prisma, userInfo}:ContextType) =>{
        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            }
        };

        const isUserAccess = await checkUserAccess(prisma, userInfo.userId, args.postId)

        if(isUserAccess){
            return isUserAccess;
        }

        const deletePost = await prisma.post.delete({
            where: {
                id: Number(args.postId)
            }
        })
        return {
            userError: null,
            post: deletePost
        }
    },

    publishedPost: async (parent: any, args: any, {prisma, userInfo}:ContextType) =>{
        
        if (!userInfo) {
            return {
                userError: "Unauthorized",
                post: null
            }
        };

        const isUserAccess = await checkUserAccess(prisma, userInfo.userId, args.postId)

        if(isUserAccess){
            return isUserAccess;
        }

        const publishedPost = await prisma.post.update({
            where: {
                id: Number(args.postId)
            },
            data: {
                published: true
            }
        })
        return {
            userError: null,
            post: publishedPost
        }
    }
}