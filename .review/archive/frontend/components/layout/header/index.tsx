import React from "react";
import "./css/header.css";

import BtnLoki from "@/components/ux/btn/btn-loki";

import Title from "./Title";
import SideBar from "./sidebar";

import Nav from "@/components/layout/nav";
import { useAuthStore } from "@/context/auth/AuthContext"

import { useRouter } from 'next/navigation';

import { Rol } from "@/global/enums";

interface HeaderProps {
    children?: React.ReactNode;
    where?: string;
}

const Header: React.FC<HeaderProps> = () => {

    const { isAuthenticated, logout, usuario } = useAuthStore();

    const router = useRouter();
    const realLogOut = () => {
        logout();
        router.push("/");
    }

    const btnRemove = () => {
        console.log("btnRemove");
        const btn = document.getElementById("btn-hamburguer-loki");
        btn?.classList.remove("active");
    }

    const toggleAside = () => {
        const container = document.getElementById("container-aside");
        container?.classList.toggle("sidebar-header");
    }

    const { ADMIN, READER } = Rol

    const menuItems = [
        { href: "/dashboard", label: "Inicio", visible: isAuthenticated },
        { href: "/dashboard/documentos", label: "documentos", visible: isAuthenticated },
        { href: "/dashboard/perfil", label: "Perfil", visible: isAuthenticated },
        { href: "/dashboard/autoridades", label: "Autoridades", visible: isAuthenticated, role: [ADMIN] },
        { href: "/dashboard/bitacora", label: "Bitácora", visible: isAuthenticated, role: [ADMIN] },
        { href: "/dashboard/usuarios", label: "Usuarios", visible: isAuthenticated, role: [ADMIN, READER] },

        { href: "/", label: "salir", onClick: () => { realLogOut() }, visible: isAuthenticated }
    ];


    console.log(usuario?.rol)

    return (
        <header className="header-container">
            <div className="desktop-header">
                <Title />
                <Nav menuItems={menuItems} userRole={usuario?.rol} />
            </div>

            <div className="movile-header">
                <nav>
                    <ul className="elements">
                        <li>
                            {isAuthenticated && <BtnLoki onClick={() => { toggleAside() }} />}
                        </li>
                        <li>
                            <Title />
                        </li>
                        <li>
                        </li>
                    </ul>
                    <SideBar
                        logoutfn={() => { btnRemove(); toggleAside(); realLogOut() }}
                    >
                        <Nav
                            userRole={usuario?.rol}
                            menuItems={menuItems}
                            onClick={() => { btnRemove(); toggleAside(); }}
                        />
                    </SideBar>
                </nav>
            </div>

        </header>
    );
};

export default Header;
