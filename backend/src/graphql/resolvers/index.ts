import usuarioResolver from "./usuario";
import createEstado from "./geografia/estado/createEstado";
import updateEstado from "./geografia/estado/updateEstado";
import getGeografia from "./geografia/getGeografia";

const resolvers = {
    Query: {
        ...usuarioResolver.Query,
        getGeografia,
    },

    Mutation: {
        ...usuarioResolver.Mutation,
        createEstado,
        updateEstado,
    },
};

export default resolvers;
