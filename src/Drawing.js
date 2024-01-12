import React, { useState, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { auth, firestore } from "./config/firebase";
import { useParams } from "react-router-dom";
import PeopleTable from "./components/PeopleTable.js";
import { useLocation } from "react-router-dom";
import { doc, collection, onSnapshot } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";

export default function Drawing(props) {
  const navigate = useNavigate();
  const statusV = "pending";

  const auth = getAuth();
  const [drawnName, setDrawnName] = useState(null);
  const functions = getFunctions();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const groupId = searchParams.get("groupId");
  const name = searchParams.get("personName");
  const uniqueId = searchParams.get("uniqueId");
  // const groupName = searchParams.get("groupName");
  const [index, setIndex] = useState(null);

  const [queuePosition, setQueuePosition] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
        alert("Please login to view profile");
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [navigate, groupId, uniqueId]);

  //finding an index of a person in the queue didnt work, and waitinglist also doesnt seem to work too well, needs to be tested
  // const queueChecker = async () => {
  //
  //   const queueRef = doc(firestore, "queue", groupId);
  //   const queueDoc = await getDoc(queueRef);

  //   if (queueDoc.exists()) {
  //     const waitingList = queueDoc.data().waitingList.length;

  //     console.log("Index found:", index); // Logging the index
  //     setIndex(waitingList);
  //     return waitingList;
  //   }
  //   return null;
  // };

  const queueCollection = collection(firestore, "queue");

  const queueDocGroup = doc(firestore, "queue", groupId);

  //setting index to length rn, setting to index doesnt work, shows -1 or 0, probably bad firestore setup, maybe should be their own documents, instead of array
  const listenToADocument = () => {
    onSnapshot(queueDocGroup, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const docData = docSnapshot.data();
        console.log(`In Realtime docdata in ${JSON.stringify(docData)}`);
        setIndex(docData.waitingList.length);
      } else {
        console.log("there was an error");
      }
    });
  };

  // const listenToADocument = (uniqueId) => {
  //   onSnapshot(queueDocGroup, (docSnapshot) => {
  //     if (docSnapshot.exists()) {
  //       const docData = docSnapshot.data();
  //       console.log(`In Realtime docdata in ${JSON.stringify(docData)}`);

  //       if (docData) {
  //         const indexus = docData.waitingList.findIndex(
  //           (item) => item.userId === uniqueId
  //         );

  //         if (indexus !== -1) {
  //           console.log("user's position is " + indexus);
  //           setIndex(indexus);
  //         } else {
  //           console.log("User not found in the waiting list");
  //           console.log(" index + " + indexus);
  //           console.log(docData.waitingList.length);
  //         }
  //       }
  //     } else {
  //       console.log("there was an error");
  //     }
  //   });
  // };

  // const listenToADocument = (uniqueId) => {
  //   onSnapshot(queueDocGroup, (docSnapshot) => {
  //     if (docSnapshot.exists()) {
  //       const docData = docSnapshot.data();

  //       if (docData) {
  //         console.log("Current waitingList:", docData.waitingList);
  //         console.log("Searching for uniqueId:", uniqueId);

  //         const index = docData.waitingList.findIndex(
  //           (item) => item.uniqueId === uniqueId
  //         );

  //         if (index !== -1) {
  //           console.log("User's position is " + index);
  //           setIndex(index);
  //         } else {
  //           console.log("User not found in the waiting list");
  //           console.log(
  //             "Length of waiting list: " + docData.waitingList.length
  //           );
  //         }
  //       }
  //     } else {
  //       console.log("There was an error");
  //     }
  //   });
  // };

  const callCreateGroupDocument = async () => {
    listenToADocument();
    // queueChecker();
    // if (drawnName === "") {
    //   // If index is -1 (not found), wait 5 seconds and try again
    //   setTimeout(queueChecker, 500);
    // }
    const createGroupDocument = httpsCallable(functions, "createGroupDocument");
    try {
      const result = await createGroupDocument({
        groupId,
        name,

        uniqueId,
      });
      alert("Group created successfully");

      const drawnName = result.data.drawnName;

      if (drawnName) {
        console.log("Person drawn successfully:", drawnName);
        alert(`Group created successfully. Person drawn: ${drawnName}`);
        setDrawnName(drawnName);
      } else {
        console.log("Failed to draw a person or no suitable person found");
        alert("Failed to draw a person or no suitable person found");
      }
    } catch (error) {
      console.error("Error calling cloud function:", error);
      alert(`Error occurred: ${error.message}`);
    }
  };

  return (
    <div className="MainView-group">
      <div className="group-wrapper">
        <div className="profile-box">
          <h1>Hello Santa {name} !</h1>

          <h3>Click the button below to draw a person!</h3>

          <button onClick={callCreateGroupDocument}>
            Click here to draw a person!
          </button>
          {drawnName && (
            <p>
              Thank you for taking a part in a draw! The person you are making
              present for is : {drawnName} !
            </p>
          )}
          {index !== null && <p>Currently people in queue: </p>}
          <p>{index}</p>
        </div>
      </div>
    </div>
  );
}
