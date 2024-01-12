import React from "react";
import { Route, Routes } from "react-router-dom";
import HomePage from "./HomePage.js";
import Register from "./Register.js";
import Login from "./Login.js";
import Profile from "./Profile.js";
import AddGroup from "./AddGroup.js";
import MyGroups from "./MyGroups.js";
import GroupDetails from "./GroupDetails.js";
import Drawing from "./Drawing.js";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route
        path="/mygroups/groupdetails/:groupId"
        element={<GroupDetails />}
      />

      <Route path="/addgroup" element={<AddGroup />} />
      <Route path="/draw" element={<Drawing />} />

      <Route path="/mygroups" element={<MyGroups />} />
      <Route path="/login" element={<Login />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;
