import { DB } from "../../db.js";

export const resolvers = {
    Query: {
      products: () => DB.products,
      product: (parent: any, {productId}, context: any) => {
        return DB.products.find((item) => item.id === productId)
      },
      categories: () => DB.categories,
      category: (parent: any, args: {id:string}, context: any) =>{
        return DB.categories.find((item) => item.id === args.id)
      },
      reviews: () => DB.reviews,
      review: (parent: any, args: {id: string}, context) =>{
        return DB.reviews.find((item) => item.productId === args.id)
      }
    },
    Product:{
      category:({categoryId}, args, context) =>{
        return DB.categories.find((item) => item.id === categoryId)
      },
      reviews: ({id}, args, context) =>{
        return DB.reviews.filter((item) => item.productId === id)
      }
    },
    Category: {
      products: ({id}, args, context) =>{
        return DB.products.filter((item) => item.categoryId === id)
      }
    }
  };