import { useEffect, useRef } from "react";
import { print } from "graphql";
import { VALIDAR_SESION } from "@/query";
import { useAuthStore } from "./AuthContext";
import { usePathname, useRouter } from 'next/navigation';
import { Usuario } from "@/global/prismaTypes";

const useValidarSesion = () => {
    const { setLogin, logout, setLoading } = useAuthStore();
    const hasRun = useRef(false);
    const navigate = useRouter();
    const location = usePathname();
    // Efecto para validar sesión
    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const validar = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.log("No hay token");

                    if (location?.startsWith("/dashboard")) {
                        navigate.push("/");
                    }

                    logout();
                    return;
                }

                const graphqlUrl = process.env.NEXT_PUBLIC_GRAPHQL_URL || "/graphql";
                const res = await fetch(graphqlUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        query: print(VALIDAR_SESION),
                        variables: { token },
                    }),
                });

                const { data, errors }: any = await res.json();

                console.log("validacion data: ", data);

                if (errors?.length || !data?.validarSesion) {
                    logout();
                    return;
                }

                const datos = data.validarSesion.data;

                const usuario = {
                    ...datos
                }

                setLogin({
                    usuario,
                    token,
                });

                // Si estamos en la página de inicio, redirigimos
                if (location === "/") {
                    navigate.push("/dashboard");
                }

            } catch (err) {
                console.error("[v0] Error validando sesión:", err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        validar();
    }, []);


};

export default useValidarSesion;
