import usuarioResolver from "./usuario";
import createEstado from "./geografia/estado/createEstado";
import updateEstado from "./geografia/estado/updateEstado";
import getGeografia from "./geografia/getGeografia";
import { createMunicipio, updateMunicipio, createPoblado, updatePoblado, createZona, updateZona } from "./geografia/catalogos";

const resolvers = {
    Query: {
        ...usuarioResolver.Query,
        getGeografia,
    },

    Mutation: {
        ...usuarioResolver.Mutation,
        createEstado,
        updateEstado,
        createMunicipio,
        updateMunicipio,
        createPoblado,
        updatePoblado,
        createZona,
        updateZona,
    },
};

export default resolvers;
