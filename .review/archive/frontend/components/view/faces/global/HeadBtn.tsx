import { $ } from "@/functions";
import BtnText from "@/components/ux/btn/btn-text";
import "./headBtn.scss"

interface HeadBtnProps {
    cardState: (css: string) => void;
    register?: boolean;
}

const HeadBtn: React.FC<HeadBtnProps> = ({ cardState, register }) => {
    const btnActive = () => {
        $("containerFormLoki")?.classList.add("active");

        //quita la clase active despues de 3 segundos
        setTimeout(() => {
            $("containerFormLoki")?.classList.remove("active");
        }, 1000);
    };

    return (
        <div className="btn-sesion">
            <BtnText
                onClick={() => {
                    cardState("front-active");
                    btnActive();
                }}
            >
                Iniciar sesión
            </BtnText>
            {register && (
                <>
                    <span className="span-sesion">|</span>
                    <BtnText
                        onClick={() => {
                            cardState("right-active");
                            btnActive();
                        }}
                    >
                        Registrarse
                    </BtnText>
                </>
            )
            }
        </div>
    );
};

export default HeadBtn;
