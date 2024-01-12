const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

const functions = require("firebase-functions");

exports.generateRandomNumber = functions.https.onCall((data, context) => {
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  return randomNumber;
});

const admin = require("firebase-admin");
admin.initializeApp();

exports.createGroupDocument = functions.https.onCall(async (data, context) => {
  const { groupId, uniqueId, name } = data;
  const db = admin.firestore();
  const queueRef = db.collection("queue").doc(groupId);

  try {
    const doc = await queueRef.get();

    if (!doc.exists) {
      await queueRef.set({ waitingList: [] });
    }

    const userData = { status: "pending", uniqueId, name };
    await queueRef.update({
      waitingList: admin.firestore.FieldValue.arrayUnion(userData),
    });

    // Invoke the queueUser function
    const drawResult = await queueUser({ groupId, uniqueId });
    console.log("drawResult33333333333333333333:", drawResult);
    return drawResult;
  } catch (error) {
    console.error("Error in createGroupDocument:", error);
    throw new functions.https.HttpsError(
      "unknown",
      "Failed to create group document",
      error
    );
  }
});

async function queueUser(data) {
  const { groupId, uniqueId } = data;
  const db = admin.firestore();
  const queueRef = db.collection("queue").doc(groupId);

  for (let attempt = 0; attempt < 20; attempt++) {
    const doc = await queueRef.get();
    const queueData = doc.data();

    if (
      queueData.waitingList.length > 0 &&
      queueData.waitingList[0].uniqueId === uniqueId &&
      queueData.waitingList[0].status === "pending"
    ) {
      let updatedWaitingList = [...queueData.waitingList];
      updatedWaitingList[0].status = "processing";

      await queueRef.update({ waitingList: updatedWaitingList });

      // Invoke drawPerson function here
      const trueDrawResult = await drawPerson({
        groupId,
        uniqueId,
        name: updatedWaitingList[0].name,
      }); // Adjust this call as needed
      console.log("trueDrawResult333333333333333333333333333:", trueDrawResult);
      return trueDrawResult;
    }

    // Wait for 5 seconds before the next attempt
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  throw new Error("Failed to process user within 20 attempts");
}

async function drawPerson(data) {
  const { groupId, name, uniqueId } = data;
  console.log("drawPerson called with:", { groupId, name, uniqueId });
  const db = admin.firestore();
  const usersRef = db.collection("users");
  const queueRef = db.collection("queue").doc(groupId);

  try {
    console.log("Fetching users from Firestore");
    const usersSnapshot = await usersRef.get();
    console.log("Users fetched successfully");

    let drawnName = null;

    // Process to find and update the drawn person in the users collection
    for (const userDoc of usersSnapshot.docs) {
      console.log("Processing user:", userDoc.id);
      const userData = userDoc.data();
      if (userData.groups) {
        console.log("Checking groups for user:", userDoc.id);
        const foundGroup = userData.groups.find(
          (group) => group.groupId === groupId
        );

        if (!foundGroup) {
          console.log("Group not found for user:", userDoc.id);
          continue;
        }

        console.log("Checking if user has already been drawn:", userDoc.id);
        const checkIfDrawed = foundGroup.persons.find(
          (person) => person.unique_id === uniqueId
        );
        if (checkIfDrawed && checkIfDrawed.had_drawed) {
          console.log("User has already been drawn:", userDoc.id);
          const queueDoc = await queueRef.get();
          if (queueDoc.exists) {
            const waitingList = queueDoc.data().waitingList;
            const updatedWaitingList = waitingList.filter(
              (item) => item.uniqueId !== uniqueId
            );
            await queueRef.update({ waitingList: updatedWaitingList });
          }
          return { drawnName: checkIfDrawed.does_present_for };
        }

        console.log("Performing draw operation for user:", userDoc.id);
        const otherPersons = foundGroup.persons.filter(
          (person) =>
            person.unique_id !== uniqueId &&
            person.has_been_drawn === false &&
            person.does_present_for !== name
        );
        if (otherPersons.length > 0) {
          const randomPersonIndex = Math.floor(
            Math.random() * otherPersons.length
          );
          const randomPerson = otherPersons[randomPersonIndex];
          randomPerson.has_been_drawn = true;
          randomPerson.is_making_them_present = name;
          drawnName = randomPerson.name;
          console.log("Updating random person:", randomPerson);

          const drawingPerson = foundGroup.persons.find(
            (person) => person.unique_id === uniqueId
          );
          if (drawingPerson) {
            drawingPerson.had_drawed = true;
            drawingPerson.does_present_for = drawnName;

            foundGroup.persons = foundGroup.persons.map((person) =>
              person.unique_id === uniqueId ? drawingPerson : person
            );
            console.log("Updating user document:", userDoc.id);
            await userDoc.ref.update({ groups: userData.groups });
            console.log("User document updated successfully:", userDoc.id);
          }
        }
      }
    }

    if (drawnName) {
      console.log("Drawn person:", drawnName);
      const queueDoc = await queueRef.get();
      if (queueDoc.exists) {
        const waitingList = queueDoc.data().waitingList;
        const updatedWaitingList = waitingList.filter(
          (item) => item.uniqueId !== uniqueId
        );
        await queueRef.update({ waitingList: updatedWaitingList });
      }
      return { drawnName: drawnName ? drawnName : "No suitable person found" };
    }
  } catch (error) {
    console.error("Error in drawPerson function:", error);
    throw new functions.https.HttpsError(
      "unknown",
      "Error in drawPerson function",
      error
    );
  }
}
