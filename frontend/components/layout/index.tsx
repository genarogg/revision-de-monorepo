import React from 'react'
import { usePathname } from 'next/navigation';
import Header from "./header"
import Footer from './Footer'
import "./css/layout.css"


import { useAuthStore } from '@/context/auth/AuthContext';
import useValidarSesion from '@/context/auth/useValidarSesion';
import Spinner from '@/components/ux/spinner';

interface LayoutProps {
    children: React.ReactNode;
    where?: string;
    header?: React.ReactNode;
    footer?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({
    children,
    where = "",
    header,
    footer
}) => {

    const { loading, isAuthenticated } = useAuthStore();
    const location = usePathname();

    useValidarSesion();

    // Determinar si estamos en una ruta de dashboard
    const isDashboardRoute = location.startsWith("/dashboard");

    // Si es ruta dashboard, mostramos spinner mientras loading o isAuthenticated=false
    const showSpinner = isDashboardRoute ? loading || !isAuthenticated : loading;

    return (
        <div className={`containerAll clean ${where}`}>
            {showSpinner ? (
                <Spinner />
            ) : (
                <>
                    {header ? header : <Header />}
                    <main>
                        {children}
                    </main>
                    {footer ? footer : <Footer />}
                </>
            )}
        </div>
    );
}

export default Layout;