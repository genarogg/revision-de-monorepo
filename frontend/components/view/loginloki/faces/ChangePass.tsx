import React, { useRef, useState } from 'react'

import Input from "@/components/ux/input";

import BtnSubmitBasic from './btn-submit';



import { MdLock } from 'react-icons/md';
import { IoMdUnlock, IoMdArrowBack } from "react-icons/io";

interface ResetPassWordProps {
    setChangePassword: (value: boolean) => void;

}

const ResetPassWord: React.FC<ResetPassWordProps> = ({ setChangePassword }) => {
    const inputRef = useRef({
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        inputRef.current = { ...inputRef.current, [name]: value };
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log(inputRef.current);
    };

    const handleBack = () => {
        localStorage.removeItem('reboot-token');
        setChangePassword(false);
    };

    return (
        <div className={`reboot-password`} >
            <div className="change login " >
                <div className="title">
                    <p>Restablecer la contraseña</p>
                </div>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmit(e)
                    }}
                >
                    <Input
                        type="password"
                        name="password"
                        placeholder="Contraseña"
                        icon={<IoMdUnlock />}
                        onChange={handleChange}
                        hasContentState={false}
                    />

                    <Input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirmar contraseña"
                        icon={<MdLock />}
                        onChange={handleChange}
                        hasContentState={false}
                    />

                    <BtnSubmitBasic
                        formData={{
                            data: inputRef
                        }}
                        setChangePassword={setChangePassword}
                        context="reboot-password"
                    >
                        Resetear contraseña
                    </BtnSubmitBasic>

                    <div className="btn-back-container">
                        <button
                            type="button"
                            onClick={handleBack}
                            className="btn-back-loki"
                        >
                            <IoMdArrowBack />
                            <span>Volver al inicio</span>
                        </button>
                    </div>
                </form>
            </div> </div>
    );
}

export default ResetPassWord;