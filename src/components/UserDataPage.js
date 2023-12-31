import React, { useState } from "react";
import NavBar from "./NavBar";
import logo from "../img/WTlogo_stacked_white_bordered.png";
import "./Settings.css";
import fb from "../firebase";
import Footer from "./Footter.js";
import { child, get, getDatabase, ref } from "firebase/database";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./UserDataPage.css";
import MuiError from "./muiError";

const UserDataPage = () => {
  const redirect = useNavigate();
  let [Nickname, SetNickname] = useState("");
  let [CurrentLang, SetCurrentLang] = useState("");
  let [Level, SetLevel] = useState("");
  let [XP, SetXP] = useState("");
  let [Email, SetEmail] = useState("");
  let [Latest, SetLatest] = useState("");
  let [Logintime, SetLogintime] = useState("");
  const [error, setError] = useState(false); //Controls Alert
  const [message, setMessage] = useState(""); //Controls Message
  const [errorseverity, seterrorseverity] = useState(""); // Controls Error Severity

  const Button = ({ text, onClick }) => {
    return (
      <button className="styled-button" onClick={onClick}>
        {text}
      </button>
    );
  };

  function GetUserData() {
    const dbRef = ref(getDatabase(fb));
    const auth = getAuth();
    let userId = auth.currentUser.uid;
    SetEmail(auth.currentUser.email);

    get(child(dbRef, "/users/" + userId))
      .then((snapshot) => {
        if (snapshot.exists()) {
          console.log(snapshot.val());
          SetNickname(snapshot.val().username);
          SetCurrentLang(snapshot.val().currentLang);
          SetLevel(snapshot.val().activity.lvl);
          SetXP(snapshot.val().activity.xp);
          SetLatest(snapshot.val().activity.latest[2]);
          SetLogintime(auth.currentUser.metadata.lastSignInTime);
          setMessage("Data Retrieval Succesful");
          setError(true);
          seterrorseverity("success");
          // functionality: snapshot.val().insertvaluetobefetchedhere[indeksinumero]
        } else {
          console.log("No data available");
        }
      })
      .catch((error) => {
        console.error(error);
      });
    setError(false);
  }

  function SettingsRedirect() {
    redirect("/Settings");
  }

  return (
    <div>
      <NavBar />
      <div className="pagecontainer">
        <div className="responsive-container">
          <img className="app-logo" src={logo} alt="Word Tangle Logo" />
          Please click on the Get User Data button to show correct data!
          <br />
          <Button text="Get User Data" onClick={GetUserData} />
          <Button text="Return to Settings" onClick={SettingsRedirect} />
          <table>
            <tbody>
              <tr>
                <th>Nickname</th>
                <th>Current Language</th>
                <th>User Level</th>
                <th>User XP</th>
                <th>Email</th>
                <th>Latest Activity</th>
                <th>Last Login Time</th>
              </tr>
              <tr>
                <td>{Nickname}</td>
                <td>{CurrentLang}</td>
                <td>{Level}</td>
                <td>{XP}</td>
                <td>{Email}</td>
                <td>{Latest}</td>
                <td>{Logintime}</td>
              </tr>
            </tbody>
          </table>
          {error ? (
            <MuiError message={message} errorseverity={errorseverity} />
          ) : (
            ``
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default UserDataPage;
