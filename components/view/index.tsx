"use client";

import React, { useState, useEffect } from 'react'
import { useRouter } from "next/navigation";
import ResetPassWord from './faces/ResetPassWord';
import Login from './faces/Login';
import Register from './faces/Register';
import ChangePass from './faces/ChangePass';

import "./faces/css/styleGeneral.scss"
import Layout from '@/components/layout/clean'
interface LokiLoginProps {
    register?: boolean;
    reset?: boolean;
    social?: boolean;
}

const LokiLogin: React.FC<LokiLoginProps> = ({
    register = true,
    reset = true,
    social = true,
}) => {
    const [formState, setFormState] = useState("initial");
    const [changePassword, setChangePassword] = useState(false);
    const router = useRouter();
    const cardState = (css: string) => {
        setFormState(css);
    };

    useEffect(() => {
        // Parsea la cadena de consulta de la URL
        const queryParams = new URLSearchParams(window.location.search);
        // Obtiene el valor del parámetro 'token'
        const token = queryParams.get("token") || localStorage.getItem("reboot-token");

        if (token) {
            localStorage.setItem("reboot-token", token);
            setChangePassword(true)
            // router.push("/");
            return;
        }

    }, []);

    return (
        <Layout>
            <div className="super-container-loki">
                <div className={`container-form-loki ${formState}`} id='containerFormLoki'>

                    {changePassword ? <ChangePass setChangePassword={setChangePassword} /> :
                        <>
                            {reset && <ResetPassWord cardState={cardState} />}
                            <Login
                                cardState={cardState}
                                register={register}
                                reset={reset}
                                social={false}
                            />
                            {register && <Register cardState={cardState} social={false} />}
                        </>
                    }

                </div>
            </div>
        </Layout>
    );
}

export default LokiLogin;