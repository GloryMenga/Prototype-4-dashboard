import React, { useState } from "react";
import Hat from "../assets/hat.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [gender, setGender] = useState(""); // Gender state
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        if (!gender) {
            alert("Please select a gender.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, gender }),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Account created successfully!");
                navigate("/login");
            } else {
                alert(data.message || "An error occurred");
            }
        } catch (error) {
            console.error(error);
            alert("Failed to register. Please try again later.");
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
                        <h2>Sign up</h2>
                    </div>
                    <div className="inputs">
                        <div className="input-group">
                            <FontAwesomeIcon icon={faUser} />
                            <input
                                type="text"
                                name="name"
                                id="inputname"
                                placeholder="enter your Name"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div className="input-group">
                            <FontAwesomeIcon icon={faEnvelope} />
                            <input
                                type="email"
                                name="email"
                                id="inputEmail22"
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
                        <div className="input-group">
                            <FontAwesomeIcon icon={faLock} />
                            <input
                                type={showPassword ? "text" : "password"}
                                id="inputPassword2"
                                name="password"
                                placeholder="enter your password again"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="gender">
                        <select
                            name="gender"
                            id="gender"
                            className="gender-select"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                        >
                            <option value="" disabled>
                                Select your gender
                            </option>
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                        </select>
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

                    <button type="submit" className="btnL">Sign Up</button>
                </form>
            </div>
            <div className="login-paragraphe">
                <p>
                    Already a member? <Link to={"/login"}>Log in</Link>
                </p>
            </div>
        </div>
    );
}

export default SignUp;
