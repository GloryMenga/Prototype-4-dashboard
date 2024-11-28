import React from "react";
import Hat from "../assets/hat.svg";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";

function SignUp(){

    const [showPassword, setShowPassword] = React.useState(false);

    const toggleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    return(
        <div className="register-container">
            <div className="logo">
                <img src={Hat} alt="Graduate hat" />
                <Link to={"/"}>
                    Scholify
                </Link>
            </div>
            <div className="login-form">
                <form id="loginform">
                <div className="title-form">
                    <h2>Sign up</h2>
                </div>
                <div className="inputs">
                    <div className="input-group">
                        <FontAwesomeIcon icon={faUser} />
                        <input type="name" name="name" id="inputname" placeholder="enter your Name" required />
                    </div>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faEnvelope} />
                        <input type="email" name="email" id="inputEmail22" placeholder="enter your email" required />
                    </div>
                    <div className="input-group">
                        <FontAwesomeIcon icon={faLock} />
                        <input
                            type={showPassword ? "text" : "password"}
                            id="inputPassword"
                            name="password"
                            placeholder="enter your password"
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
                            required
                        />
                    </div>
                </div>
                <div class="check-password">
                    <input
                    type="checkbox"
                    id="showPassword"
                    checked={showPassword}
                    onChange={toggleShowPassword}
                    />
                    <p>Show Password</p>
                </div>

                <button type="submit" class="btnL">Sign Up</button>
                </form>
            </div>
            <div className="login-paragraphe">
                <p>Already a member? <Link to={"/login"}>Log in</Link></p>
            </div>
        </div>
    );
}

export default SignUp;