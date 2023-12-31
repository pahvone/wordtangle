import NavBar from "./NavBar";
import logo from "../img/WTlogo_stacked_white_bordered.png";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./UsernameChange.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, ref, update } from "firebase/database";

const db = getDatabase();
const auth = getAuth();

const Button = ({ text, onClick }) => {
  return (
    <button className="styled-button" onClick={onClick}>
      {text}
    </button>
  );
};

const Usernamechange = () => {
  const redirect = useNavigate();
  const [username, setusername] = useState("");

  function UploadUserName() {
    const userId = auth.currentUser.uid;
    onAuthStateChanged(auth, (user) => {
      if (user) {
        update(ref(db, "/users/" + userId), {
          username: username,
        });
        console.log(user.uid);
      } else {
        // User is signed out
        // ...
      }
      redirect("/Dashboard");
    });
  }
  return (
    <div>
      <NavBar />
      <div className="responsive-container">
        <img className="app-logo" src={logo} alt="Word Tangle Logo" />
        <label htmlFor="username" className="slogan">
          Nickname
        </label>
        <p style={{ margin: "0px" }} />
        <input
          className="textfield"
          type="text"
          id="username"
          value={username}
          onChange={(e) => setusername(e.target.value)}
        />
        <Button text="Update Nickname" onClick={UploadUserName} />
      </div>
    </div>
  );
};

export default Usernamechange;
