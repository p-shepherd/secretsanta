import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "./config/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function Login(props) {
  const navigate = useNavigate();

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, you can access user details with 'user' object
        console.log("Logged in:", user.email);
      } else {
        // User is signed out, navigate to login page
        navigate("/login");
        alert("Please login to view profile");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  //log out button functionality

  const logOut = () => {
    auth.signOut();
  };

  const navigateAdd = () => {
    navigate("/addgroup");
  };

  const navigateMy = () => {
    navigate("/mygroups");
  };

  return (
    <div className="MainView-profile">
      <div className="profile-wrapper">
        <div className="profile-box">
          <h1 id="profileh1">Profile</h1>
          <div className="groups">
            <button id="addGroup" onClick={navigateAdd}>
              Add Group +
            </button>
            <button id="myGroup" onClick={navigateMy}>
              My Groups
            </button>
          </div>
        </div>
        <button onClick={logOut}>Log out</button>
      </div>
    </div>
  );
}
