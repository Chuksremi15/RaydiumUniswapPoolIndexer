import { Link, NavLink } from "react-router-dom";

export const Nav = () => {
  return (
    <div className="flex gap-x-4 ">
      <NavLink
        className={({ isActive }) =>
          isActive
            ? " text-white  transition-all "
            : "text-gray2 transition-all "
        }
        to="/"
      >
        <h1 className="text-xl ">Raydium</h1>
      </NavLink>
      <NavLink
        className={({ isActive }) =>
          isActive
            ? " text-white transition-all "
            : "text-gray2 transition-all "
        }
        to="/uniswap"
      >
        <h1 className="text-xl ">Uniswap</h1>
      </NavLink>
    </div>
  );
};
