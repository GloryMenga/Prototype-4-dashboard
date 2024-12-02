import React from "react";
import SideNav from "../components/SideNav.jsx";
import Dashboard from "../components/Dashboard.jsx";
import Grading from "../components/Grading.jsx";

function Home(){

    return(
        <>
            <div className="container">
                <SideNav />
                <div className="wrapper">
                    <Dashboard />
                    <Grading />
                </div>
            </div>
        </>
    );
}

export default Home;