import "./css/sideBar.css"


interface SideBarProps {
  children?: React.ReactNode;
  className?: string;
  logoutfn?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({ className, children, logoutfn }) => {

  return (
    <div className={`container-aside ${className}`} id="container-aside">
      <aside className="sidebar">
        {children}
      </aside>
      <div className="salirBtn">
        <button onClick={logoutfn}>
          cerrar sesion
        </button>
      </div>
    </div>
  );
};

export default SideBar;
