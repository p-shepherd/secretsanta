/* eslint-disable no-unused-vars */

import "./styles.css";
import React, { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, firestore } from "./config/firebase";
import { Link, useNavigate } from "react-router-dom";

function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const registerNavigate = () => {
    navigate("/register");
  };

  const loginNavigate = () => {
    navigate("/login");
  };

  return (
    <div className="HomePage">
      <h1>Secret Santa</h1>
      <h3>Create a group and let them take a part in a draw!</h3>
      <div className="buttonsLog">
        <button className="logButton" onClick={registerNavigate} id="register">
          Click here to register
        </button>
        <button className="logButton" id="login" onClick={loginNavigate}>
          Click here to login
        </button>
      </div>
    </div>
  );
}

export default HomePage;
