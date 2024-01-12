/* eslint-disable no-unused-vars */

import React, { useState } from "react";
import { FaEnvelope, FaLock } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "./config/firebase";
import { firestore } from "./config/firebase"; // Import Firestore from your Firebase config file
import { doc, setDoc } from "firebase/firestore";

import {
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  sendEmailVerification,
} from "firebase/auth";
import { RiEyeCloseLine, RiEyeLine } from "react-icons/ri";
import { RxEyeClosed, RxEyeOpen } from "react-icons/rx";

export default function Register(props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordR, setPasswordR] = useState("");
  const [wrong, setWrong] = useState(false);
  const navigate = useNavigate();
  



  const register = async (e) => {
    console.log("register clicked")
    e.preventDefault(); // Prevent the default form submission
    if (password === passwordR) {
      try {
        // Create the user in Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password,
        );
        const user = userCredential.user;

        // Send email verification
        await sendEmailVerification(user);

        // Create a document in Firestore for the user
        const userRef = doc(firestore, "users", user.uid);
        await setDoc(userRef, {
          email: user.email,
          uid: user.uid,
          groups: [],
        });
         alert("Your account has been created successfully. Please check your email to confirm your account before logging in.");


        setEmail("");
        setPassword("");
        setPasswordR("");

        // After successful registration and email sent, redirect to a page informing the user to check their email
        navigate("/");
      } catch (error) {
        console.error("Registration error:", error);
         alert("An error occurred during registration. Please try again.");
      }
    } else {
      setWrong(true);
      setPassword("");
      setPasswordR("");
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordR, setShowPasswordR] = useState(false);
  // const isEmailVerified = auth.currentUser && auth.currentUser.emailVerified;

  return (
    <div className="MainView">
      <div className="form-wrapper">
        <div className="form-box">
          {wrong ? (
            <p className="error-message">
              Your passwords don't match <br />
              or you didn't resolve the captcha.
            </p>
          ) : (
            <p></p>
          )}
         
          <h2>Register</h2>
          <form action="#" onSubmit={register}>
            <div className="input-box">
              <input
                placeholder=""
                value={email}
                name="email"
                id="email"
                onChange={(e) => setEmail(e.target.value)}
              />
              <label htmlFor="email">Email</label>
              <FaEnvelope className="input-icon" />
            </div>
            <div className="input-box">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="off"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <label htmlFor="password">Password</label>
              <FaLock className="input-icon" />
              {password && (
                <button
                  className="visibility-btn"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {" "}
                  {showPassword ? <RxEyeClosed /> : <RxEyeOpen />}{" "}
                </button>
              )}
            </div>
            <div className="input-box">
              <input
                type={showPasswordR ? "text" : "password"}
                id="password"
                name="password"
                autoComplete="off"
                placeholder=""
                value={passwordR}
                onChange={(e) => setPasswordR(e.target.value)}
              />
              <label htmlFor="password">Repeat Password</label>
              <FaLock className="input-icon" />
              {passwordR && (
                <button
                  className="visibility-btn"
                  onClick={() => setShowPasswordR(!showPasswordR)}
                >
                  {" "}
                  {showPasswordR ? <RxEyeClosed /> : <RxEyeOpen />}{" "}
                </button>
              )}
            </div>

            <button type="submit" onClick={register}>Register</button>
          </form>
          <div className="login-register">
            <p>Already have an account?</p>
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        </div>
      </div>
    </div>
  );
}
