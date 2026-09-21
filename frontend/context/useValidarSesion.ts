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
    const pendingLogin = useRef<{ usuario: Usuario | null; token: string } | null>(null);

    // Efecto para validar sesión
    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const validar = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    console.log("No hay token");

                   // if (location?.startsWith("/dashboard")) {
                  //      navigate.push("/");
                  //  }

                   // logout();
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
                    logout();
                    return;
                }

                const datos = data.validarSesion.data;

                const usuario = {
                    ...datos
                }

                // Guardamos temporalmente para login posterior
                pendingLogin.current = { usuario, token };

                // Si estamos en la página de inicio, redirigimos
                if (location === "/") {
                  //  navigate.push("/dashboard");
                }

                else {
                    setLogin({
                        usuario,
                        token
                    });
                }

            } catch (err) {
                console.error(err);
                logout();
                setLoading(false);
            }
        };

        validar();
    }, []);

    useEffect(() => {
        if (pendingLogin.current && location === "/dashboard") {
            setLogin(pendingLogin.current);
            pendingLogin.current = null;
        }
    }, [location, setLogin]);
};

export default useValidarSesion;