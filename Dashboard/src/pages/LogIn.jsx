import React, { useState, useContext } from "react";
import Hat from "../assets/hat.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function LogIn() {
    const { setUser } = useContext(AuthContext);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch("http://localhost:5000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Save user data in AuthContext and localStorage
                setUser(data.data);
                localStorage.setItem("user", JSON.stringify(data.data)); // Save user in localStorage
                alert("Logged in successfully!");
                navigate("/");
            } else {
                alert(data.message || "Invalid credentials");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to log in. Please try again later.");
        }
    };

    return (
        <div className="register-container">
            <div className="logo">
                <img src={Hat} alt="Graduate hat" />
                <Link to={"/"}>Scholify</Link>
            </div>
            <div className="login-form">
                <form id="loginform" onSubmit={handleSubmit}>
                    <div className="title-form">
                        <h2>Log in</h2>
                    </div>
                    <div className="inputs">
                        <div className="input-group">
                            <FontAwesomeIcon icon={faEnvelope} />
                            <input
                                type="email"
                                name="email"
                                id="inputEmail"
                                placeholder="enter your email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <FontAwesomeIcon icon={faLock} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="inputPassword"
                                name="password"
                                placeholder="enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="check-password">
                        <input
                            type="checkbox"
                            id="showPassword"
                            checked={showPassword}
                            onChange={toggleShowPassword}
                        />
                        <p>Show Password</p>
                    </div>

                    <button type="submit" className="btnL">Log in</button>
                </form>
            </div>
            <div className="login-paragraphe">
                <p>
                    Don't have an account yet? <Link to={"/signup"}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default LogIn;
