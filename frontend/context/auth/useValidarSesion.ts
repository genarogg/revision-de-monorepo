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
                        console.log("location: ", location);
                    logout();
                    return;
                }

                const res = await fetch("/graphql", {
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
                    console.log("errors: ", errors);
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
                console.error(err);
                console.log("err: ", err);
                logout();
                setLoading(false);
            }
        };

        validar();
    }, []);


};

export default useValidarSesion;
