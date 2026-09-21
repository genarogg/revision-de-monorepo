import usuarioResolver from "./usuario";

const resolvers = {
    Query: {
        ...usuarioResolver.Query,
    },

    Mutation: {
        ...usuarioResolver.Mutation,
    },
};

export default resolvers;