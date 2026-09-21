import { prisma } from "@fn";
import seedUsers from "./seedUsers";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const seed = async () => {
    try {
        const adminUser = await prisma.usuario.findUnique({
            where: { email: "genarrogg@gmail.com" },
        });

        if (adminUser) {
            return "ya plantada"
        }

        await seedUsers();
        await delay(100);

        return "recien plantada"
    } catch (error) {
        console.error("Error al sembrar la base de datos:", error);
    }
};

export default seed;