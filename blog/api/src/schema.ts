export const typeDefs = `#graphql
    type Query {
        me: User
        users: [User]
        posts: [Post]
        profile(userId: ID!): Profile
    }  

    type Post {
        id:ID!
        title: String!
        content: String!
        author: User
        createdAt: String!
        published: Boolean!
    }
    type User {
        id: ID!
        name: String!
        email: String!
        createdAt: String!
        posts: [Post]
    }
    type Profile{
        id: ID!
        bio: String
        user: User!
        createdAt: String!
    }

    type AuthPayload {
        userError: String,
        token: String
    }

    type PostPayload {
        userError: String
        post: Post
    }

    input PostInput {
        title: String!
        content: String!
    }

    type Mutation {
        signup (
            name: String! 
            email: String! 
            password: String!
            ): AuthPayload,
        signin(email: String! password: String!): AuthPayload,
        
        addPost(post: PostInput!): PostPayload,
        updatePost(postId: ID!, post: PostInput!): PostPayload,
        deletePost(postId: ID!): PostPayload,
        publishedPost(postId: ID!): PostPayload
    }

`;