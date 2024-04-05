import { Query } from "./Query/Query";
import { Mutation } from "./Mutations/Mutation";
import { Post } from "./post";
import { User } from "./user";
import { profile } from "console";

export const resolvers = {
    Query,
    Mutation,
    Post,
    User,
    profile
};