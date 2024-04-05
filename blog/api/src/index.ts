import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { Prisma, PrismaClient } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';
import { jwtHelper } from './utils/helper';

const prisma = new PrismaClient();

export interface ContextType {
    prisma : PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs>,
    userInfo: {
        userId: number | null
    } | null
}

const server = new ApolloServer({
    typeDefs,
    resolvers,
});

const main = async () => {
    const { url } = await startStandaloneServer(server, {
        listen: { port: 4000 },
        context: async({req}): Promise<ContextType> =>{
            const userInfo = await jwtHelper.verifyToken(req.headers.authorization as string);
            return {
                prisma,
                userInfo
            }
        }
    });
    console.log(`🚀  Server ready at: ${url}`);
}
main();