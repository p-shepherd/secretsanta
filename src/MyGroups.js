import React, { useState, useEffect } from "react";
import { IoMdPersonAdd } from "react-icons/io";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "./config/firebase";
import {
  doc,
  setDoc,
  getDoc,
  getFirestore,
  arrayUnion,
  updateDoc,
  getDocs,
  where,
  query,
  collection,
} from "firebase/firestore";

export default function MyGroups(props) {
  const navigate = useNavigate();

  const auth = getAuth();

  const [group, setGroup] = useState([]);

  console.log(group);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in, you can access user details with 'user' object
        console.log("Logged in:", user.email);
        fetchData();
      } else {
        // User is signed out, navigate to login page
        navigate("/login");
        alert("Please login to view profile");
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    let uid = auth?.currentUser?.uid;
    try {
      const userRef = doc(firestore, "users", uid); // Replace 'uid' with actual user UID
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const groupsArray = docSnap.data().groups; // Assuming 'groups' is the field name
        const transformedGroups = groupsArray.map((group) => {
          return {
            name: group.groupName,
            id: group.groupId,
            creationDate: group.creationDate,
            players:
              group.persons?.filter((person) => person.had_drawed).length || 0,
            total: group.persons?.length || 0,
          };
        });

        setGroup(transformedGroups);
      } else {
        console.log("No such document!");
      }
    } catch (error) {
      console.error("Error getting document:", error);
    }
  };

  const navigateDetails = (groupId) => {
    navigate(`/mygroups/groupdetails/${groupId}`);
  };

  return (
    <div className="MainView-group">
      <div className="group-wrapper">
        <div className="profile-box">
          <h1>My Groups</h1>
          <div className="groupHolderMy">
            {group.map((group) => (
              <div
                className="card"
                key={group.id}
                onClick={() => navigateDetails(group.id)}
              >
                <h2 style={{ padding: "5px", marginTop: "0px" }}>
                  {group.name}
                </h2>
                <p style={{ padding: "0px", marginTop: "0px" }}>
                  Created on: {group.creationDate}
                </p>
                <p style={{ padding: "0px", marginTop: "0px" }}>
                  Players: {group.players}/{group.total}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
