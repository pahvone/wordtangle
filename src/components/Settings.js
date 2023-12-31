import React, { useState } from "react";
import NavBar from "./NavBar";
import logo from "../img/WTlogo_stacked_white_bordered.png";
import "./Settings.css";
import { useNavigate } from "react-router-dom";
import { child, getDatabase, ref, remove } from "firebase/database";
import {
  getAuth,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  signOut,
} from "firebase/auth";
import fb from "../firebase";
import Footer from "./Footter.js";
import Leaderboards from "./Leaderboards.js";
import MuiError from "./muiError";

const Settings = () => {
  const dbRef = ref(getDatabase(fb));
  const auth = getAuth();
  const user = auth.currentUser;
  const [password, setpassword] = useState("");
  const redirect = useNavigate();
  const [googleVar, setGoogleVar] = useState(true);
  const [error, setError] = useState(false); //Controls Alert
  const [message, setMessage] = useState(""); //Controls Message
  const [errorseverity, seterrorseverity] = useState(""); // Controls Error Severity

  auth.onAuthStateChanged(function (user) {
    if (user) {
      //check provider data
      user.providerData.forEach(function (profile) {
        if (profile) {
          if (profile.providerId) {
            if (profile.providerId == "google.com") {
              setGoogleVar(false);
            } else {
              setGoogleVar(true);
            }
          }
        }
      });
    }
  });

  function Usernameredirect() {
    redirect("/UsernameChange");
  }

  function Passwordredirect() {
    redirect("/PasswordChange");
  }
  const Button = ({ text, onClick }) => {
    return (
      <button className="styled-button" onClick={onClick}>
        {text}
      </button>
    );
  };

  const WarningButton = ({ text, onClick }) => {
    return (
      <button className="styled-warning-button" onClick={onClick}>
        {text}
      </button>
    );
  };

  const CriticalWarningButton = ({ text, onClick }) => {
    return (
      <button className="styled-critical-warning-button" onClick={onClick}>
        {text}
      </button>
    );
  };

  function UserDataRedirect() {
    redirect("/UserDataPage");
  }

  function DeleteUserData(signInProvider) {
    let userId = auth.currentUser.uid;
    console.log(auth.currentUser.uid);

    if (signInProvider != "google.com") {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        document.getElementById("passwordID").value,
      );
      //reauthenticate the user to facilitate removal of account
      reauthenticateWithCredential(auth.currentUser, credential)
        .then(() => {
          deleteUser(user).then(() => {
            remove(child(dbRef, "/users/" + userId));
            redirect("/");
            console.log("User Succesfully Deleted!");
            const leaderboard = new Leaderboards();
            leaderboard.deleteEntry(userId);
          });
        })
        .catch((error) => {
          switch (error.code) {
            case "auth/invalid-login-credentials":
              setMessage(
                "The password in the confirmation field is wrong! You should type in your current password to confirm the account deletion.",
              );
              setError(true);
              seterrorseverity("warning");
              break;
            case "auth/too-many-requests":
              setMessage("You have done too many requests to the server!");
              setError(true);
              seterrorseverity("warning");
          }
          // alert(error.code); uncomment for catching un-documented errors.
          setError(false);
        })
        .finally(() => {
          //here because the
          const leaderboard = new Leaderboards();
          leaderboard.deleteEntry(userId);
        });
    }
  }

  function SignOut() {
    signOut(auth)
      .then(() => {
        console.log("Successfully signed out!");
        redirect("/");
      })
      .catch((error) => {
        console.error();
      });
  }

  return (
    <div>
      <NavBar />
      <div className="pagecontainer">
        <div className="responsive-container">
          <img className="app-logo" src={logo} alt="Word Tangle Logo" />
          <p />
          <Button text="Change Nickname" onClick={Usernameredirect} />
          <br />
          <Button text="Change Password" onClick={Passwordredirect} />
          <br />
          <Button text="Show User Data" onClick={UserDataRedirect} />
          <br />
          <WarningButton text="Sign Out" onClick={SignOut} />
          <br />
          <p>
            {googleVar && (
              <input
                className="textfield"
                type="password"
                id="passwordID"
                value={password}
                placeholder="Enter password to delete account"
                onChange={(e) => setpassword(e.target.value)}
              />
            )}
          </p>
          <CriticalWarningButton
            text="Delete Account"
            onClick={DeleteUserData}
          />
        </div>
      </div>

      {error ? (
        <MuiError message={message} errorseverity={errorseverity} />
      ) : (
        ``
      )}
      <Footer />
    </div>
  );
};

export default Settings;
