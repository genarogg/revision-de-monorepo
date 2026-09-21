import React, { useRef } from 'react'
import { MdLock } from 'react-icons/md';
import { IoMdUnlock } from "react-icons/io";
import { BsFillEnvelopeHeartFill, BsPersonFill } from 'react-icons/bs';

import Input from "@/components/ux/input";
import BtnSubmitBasic from './btn-submit';

import HeadBtn from "./global/HeadBtn";
import RedesLogin from './global/RedesLogin';

interface RegisterProps {
    cardState: (css: string) => void;
    social?: boolean;
}

const Register: React.FC<RegisterProps> = ({ cardState, social = false }) => {
    const inputRef = useRef({
        primerNombre: "",
        primerApellido: "",
        telefono: "",
        cedula: "",
        email: "",
        password: "",
        confirmPassword: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        inputRef.current = { ...inputRef.current, [name]: value };
    };

    return (

        <div className={`register right ${social ? "social" : ""}`} id="register">
            <HeadBtn cardState={cardState} register={true} />
            <form onSubmit={(e) => { e.preventDefault() }}>
                <Input
                    type="text"
                    name="primerNombre"
                    placeholder="Primer nombre"
                    icon={<BsPersonFill />}
                    onChange={handleChange}
                />

                <Input
                    type="text"
                    name="primerApellido"
                    placeholder="Primer apellido"
                    icon={<BsPersonFill />}
                    onChange={handleChange}
                />

                <Input
                    type="text"
                    name="telefono"
                    placeholder="Teléfono"
                    icon={<BsPersonFill />}
                    onChange={handleChange}
                />

                <Input
                    type="number"
                    name="cedula"
                    placeholder="Cédula"
                    icon={<BsPersonFill />}
                    onChange={handleChange}
                />

                <Input
                    type="email"
                    name="email"
                    id='emailRegister'
                    placeholder="Email"
                    icon={<BsFillEnvelopeHeartFill />}
                    onChange={handleChange}
                />

                <Input
                    type="password"
                    name="password"
                    placeholder="Contraseña"
                    icon={<IoMdUnlock />}
                    onChange={handleChange}
                />

                <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirmar contraseña"
                    icon={<MdLock />}
                    onChange={handleChange}
                />

                {social && <RedesLogin />}

                <BtnSubmitBasic
                    formData={{
                        data: inputRef,
                    }}
                    context="register"
                >
                    Registrarse
                </BtnSubmitBasic>

                <div className="text-recovery">
                    <span>
                        Al registrarte, aceptas nuestras Condiciones de uso y Política de privacidad.
                    </span>
                </div>
            </form>
        </div>
    );
}

export default Register;