import React, { useState, useEffect } from "react";
import { IoMdPersonAdd } from "react-icons/io";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { v4 as uuidv4 } from "uuid";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "./config/firebase";
import { useParams } from "react-router-dom";
import PeopleTable from "./components/PeopleTable.js";
import PeopleTable2 from "./components/PeopleTable2.js";
import { doc, onSnapshot } from "firebase/firestore";

export default function GroupDetails(props) {
  const navigate = useNavigate();

  const auth = getAuth();

  const { groupId } = useParams();

  const [people, setPeople] = useState([]);
  const [name, setName] = useState("");
  const [showPresents, setShowPresents] = useState(false);

  console.log(people);

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
    if (!uid) {
      console.log("User not logged in");
      return;
    }

    const userRef = doc(firestore, "users", uid);

    // Set up a real-time listener
    const unsubscribe = onSnapshot(
      userRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const groupsArray = docSnap.data().groups; // Assuming 'groups' is the field name
          const group = groupsArray.find((group) => group.groupId === groupId);

          if (group) {
            setPeople(group.persons); // Assuming 'persons' is the field you want to set
            setName(group.groupName);
            setShowPresents(group.presentsShow);
          } else {
            console.log("Group not found");
          }
        } else {
          console.log("User document does not exist");
        }
      },
      (error) => {
        console.log("Error getting document:", error);
      }
    );

    // Remember to unsubscribe when the component unmounts or the user changes
    return () => unsubscribe();
  };

  const handleDownload = () => {
    let textData = people;
    if (!showPresents) {
      textData = people
        .map(
          (person, index) =>
            `${index} ${person.name} ${person.had_drawed} ${person.has_been_drawn} ${person.link_for_drawing}\n`
        )
        .join("");
    } else {
      textData = people
        .map(
          (person, index) =>
            `${index} ${person.name} ${person.does_present_for} ${person.is_making_them_present} ${person.had_drawed} ${person.has_been_drawn} ${person.link_for_drawing}\n`
        )
        .join("");
    }
    const element = document.createElement("a");
    const file = new Blob([textData], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "people.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return (
    <div className="MainView-group">
      <div className="group-wrapper">
        <div className="profile-box">
          <h1>Info about users:</h1>
          <h2>{name}</h2>
          <div className="table-container">
            {!showPresents ? (
              <PeopleTable2 people={people} />
            ) : (
              <PeopleTable people={people} />
            )}
          </div>
        </div>
        <button onClick={handleDownload}>Download as .txt file!</button>
      </div>
    </div>
  );
}
