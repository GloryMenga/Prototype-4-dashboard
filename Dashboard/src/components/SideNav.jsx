import React from "react";
import { Link, useLocation } from "react-router-dom";
import Hat from "../assets/hat.svg";
import Default from "../assets/default.svg";
import Dashboard from "../assets/dashboard.svg";
import Calendar from "../assets/calendar.svg";
import Settings from "../assets/settings.svg";

function SideNav() {
    const location = useLocation();

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <nav>
                <ul>
                    <div className="nav-container">
                        <div className="logo">
                            <img src={Hat} alt="Graduate hat" />
                            <Link to={"/"}>
                                Scholify
                            </Link>
                        </div>
                        <div className="account">
                            <img src={Default} alt="Default profile picture" />
                            <Link to={"/login"}>
                                Log in
                            </Link>
                        </div>
                        <div className="menu">
                        <Link to={"/"}>
                            <div
                                className={`menu-icon ${isActive("/") ? "active" : ""}`}
                            >
                                
                                <img src={Dashboard} alt="Dashboard" />

                                    <p>Dashboard</p>
                            </div>
                        </Link>
                        <Link to={"/calendar"}>
                            <div
                                className={`menu-icon ${isActive("/calendar") ? "active" : ""}`}
                            >
                                <img src={Calendar} alt="Calendar" />
                                    <p>Calendar</p>
                            </div>
                        </Link>
                        <Link to={"/settings"}>
                            <div
                                className={`menu-icon ${isActive("/settings") ? "active" : ""}`}
                            >
                                <img src={Settings} alt="Settings" />
                                    <p>Settings</p>
                            </div>
                        </Link>
                        </div>
                    </div>
                    <div className="settings">
                        <p>Light / Dark</p>
                    </div>  
                </ul>
            </nav>
        </>
    );
}

export default SideNav;
