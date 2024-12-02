import React, { useContext } from "react";
import SideNav from "../components/SideNav.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Grading from "../components/Grading.jsx";
import { AuthContext } from "../context/AuthContext";

function Home() {
    const { user } = useContext(AuthContext);

    return (
        <div className="container">
            <SideNav />
            <div className="wrapper">
                <Dashboard />
                {user && user.status === "Teacher" && <Grading />}
            </div>
        </div>
    );
}

export default Home;
