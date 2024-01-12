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
} from "firebase/firestore";

export default function AddGroup(props) {
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

  const [groupName, setGroupName] = useState("");

  const [persons, setPersons] = useState([]);
  const [presents, setPresents] = useState("no"); // Initial state
  const [boolPresent, setBoolPresent] = useState(false);
  const togglePresents = () => {
    setPresents(presents === "no" ? "yes" : "no");
    setBoolPresent(!boolPresent);
  };
  const createGroup = async () => {
    let errorMessage = "";

    if (groupName === "") {
      errorMessage += "Please enter a group name.\n";
    }
    if (persons.length <= 2) {
      errorMessage += "Please add at least 3 people to the group.\n";
    }

    for (let i = 0; i < persons.length; i++) {
      if (persons[i].name === "") {
        errorMessage += "Please enter a name for each person.\n";
        break;
      }
    }

    const names = persons.map((person) => person.name);
    const uniqueNames = [...new Set(names)];
    if (names.length !== uniqueNames.length) {
      errorMessage += "Please enter unique names for each person.\n";
    }

    for (let i = 0; i < persons.length; i++) {
      if (!/^[^\p{P}\p{S}]+$/u.test(persons[i].name)) {
        errorMessage +=
          "Please don't use punctuation or special symbols in the names.\n";
        break;
      }
    }

    if (errorMessage) {
      alert(errorMessage);
      return;
    }

    // Get the current user's UID
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) {
      alert("User is not authenticated");
      return;
    }

    // Construct the group data
    const uniqueId = uuidv4();
    const groupId = groupName + uuidv4(); // Unique group ID
    const groupData = {
      groupName: groupName,
      groupId,
      creationDate: new Date().toLocaleDateString("en-GB"),
      timesModified: 0,
      presentsShow: boolPresent,
      persons: persons.map((person) => {
        const personUniqueId = uuidv4(); // Generate a unique ID for each person
        return {
          name: person.name,
          unique_id: personUniqueId, // Assign the unique ID
          has_been_drawn: false,
          had_drawed: false,
          does_present_for: "none",
          is_making_them_present: "none",
          link_for_drawing: `https://192.168.56.1:3000/draw?groupId=${encodeURIComponent(
            groupId
          )}&personName=${encodeURIComponent(
            person.name
          )}&groupName=${encodeURIComponent(
            groupName
          )}&uniqueId=${encodeURIComponent(personUniqueId)}`,
        };
      }),
    };

    // Save the group data to Firestore
    const db = getFirestore();
    try {
      const userDoc = doc(db, `users/${user.uid}`);
      await updateDoc(userDoc, {
        groups: arrayUnion(groupData),
      });
      console.log("Group added to user's profile successfully");
      alert("Group added to user's profile successfully");
      navigate("/mygroups");
    } catch (error) {
      console.error("Error adding group to user's profile:", error);
      alert("Error adding group to user's profile");
    }
  };

  const appendPerson = () => {
    const newPerson = {
      id: persons.length + 1,
      name: "",
    };
    setPersons([...persons, newPerson]);
  };

  const handleDeletePerson = (personId) => {
    setPersons(persons.filter((person) => person.id !== personId));
  };

  const handleNameChange = (e, personId) => {
    const updatedPersons = persons.map((person) => {
      if (person.id === personId) {
        return { ...person, name: e.target.value };
      }
      return person;
    });
    setPersons(updatedPersons);
  };

  return (
    <div className="MainView-group">
      <div className="group-wrapper">
        <div className="profile-box">
          <h1>Add group</h1>
        </div>
        <input
          placeholder="Enter group name"
          value={groupName}
          name="groupName"
          id="groupName"
          onChange={(e) => setGroupName(e.target.value)}
        />
        <div className="groupHolder">
          <div className="addPerson" onClick={appendPerson}>
            <div className="addPersonContent">
              <p style={{ fontSize: "1.1rem" }}>Add Person</p>
              <IoMdPersonAdd style={{ width: "70%", height: "70%" }} />
            </div>
          </div>
          {persons.map((person) => (
            <div className="addPerson" key={person.id}>
              <div className="addPersonContent">
                <AiOutlineCloseCircle
                  onClick={() => handleDeletePerson(person.id)}
                  className="closeIcon" // Add this class for styling
                />
                <p>{person.id}.</p>
                <input
                  id={`nameEnter-${person.id}`}
                  placeholder="Enter person name"
                  onChange={(e) => handleNameChange(e, person.id)}
                  value={person.name}
                  className="nameEnter"
                />
                <p>{person.name}</p>
              </div>
            </div>
          ))}
        </div>
        <p>Do you want to see who is making presents?</p>
        <label className="switch">
          <input
            type="checkbox"
            checked={presents === "yes"}
            onChange={togglePresents}
          />
          <span className="slider round"></span>
        </label>
        <span>{presents.toUpperCase()}</span>
        <button id="createGroupButton" onClick={createGroup}>
          Create Group
        </button>
      </div>
    </div>
  );
}
