import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  getDatabase,
  ref,
  push,
  set,
  update,
  onValue,
  get,
  child,
} from "firebase/database";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import NavBar from "./NavBar";
import logo from "../img/WTlogo_stacked_white_bordered.png";
import Footer from "./Footter";
import ActivityTracker from "./ActivityTracker";
import "./ForumView.css";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import fb from "../firebase";

const Button = ({ text, onClick }) => {
  return (
    <button className="styled-button" onClick={onClick}>
      {text}
    </button>
  );
};

const ForumView = () => {
  const [threadList, setThreadList] = useState([]);
  const { forum } = useParams();
  const db = getDatabase();
  const forumRef = ref(db, "/forums/" + forum);
  onValue(
    forumRef,
    (snapshot) => {
      getThreads(snapshot.val(), forum);
    },
    (errorObject) => {
      console.log("The read failed: " + errorObject.name);
    },
  );

  function getThreads(data, forum) {
    let listOfThreads = [];
    Object.keys(data).forEach((key) => {
      if (key != "latestPost") {
        const dbRef = ref(db, "users/" + data[key].author + "/username");
        let username = "error";
        let replies = data[key].replies;
        let repliesLength;
        if (typeof replies === "object") {
          repliesLength = Object.keys(replies).length;
        } else {
          repliesLength = 0;
        }
        onValue(dbRef, (snapshot) => {
          username = snapshot.val();
        });
        const newThread = {
          id: key,
          title: data[key].title,
          postText: data[key].text,
          threadCreator: username,
          replies: repliesLength,
          latestActivity: data[key].latestPost ?? data[key].creationDate,
        };
        listOfThreads.push(newThread);
      }
    });
    if (JSON.stringify(listOfThreads) != JSON.stringify(threadList)) {
      setThreadList(listOfThreads);
    }
  }

  const [threadTitle, setThreadTitle] = useState("");
  const [threadText, setThreadText] = useState("");

  function createThread() {
    console.log(threadTitle);
    const auth = getAuth();
    const db = getDatabase();
    const userId = auth.currentUser.uid;
    const newThread = {
      author: userId,
      title: threadTitle,
      text: threadText,
      creationDate: Date.now(),
      replies: [],
    };
    const forumsRef = ref(db, "forums/" + forum);
    const newThreadRef = push(forumsRef);
    set(newThreadRef, newThread);
    update(forumsRef, { latestPost: Date.now() });
    setThreadTitle("");
    setThreadText("");
  }
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (!loaded) {
      let tracker = new ActivityTracker();
      tracker.updateLatestActivity("forums");
      setLoaded(true);
    }
  });

  return (
    <div>
      <NavBar />
      <div className="pagecontainer">
        <div className="responsive-container">
          <Box sx={{ flexGrow: 1 }}>
            <Grid
              justifyContent="space-between"
              container
              className="forum-header-container"
            >
              <Grid item xs={5}>
                <div className="forum-title-header">
                  <span>
                    <NavLink className="navlink" to={"/Forums"}>
                      Forum Index
                    </NavLink>{" "}
                    &gt;&gt; {forum.charAt(0).toUpperCase() + forum.slice(1)}
                  </span>
                </div>
              </Grid>
              <Grid item xs={2}>
                <div className="poster">Poster</div>
              </Grid>
              <Grid item xs={2}>
                <div className="repliesAmount">Replies</div>
              </Grid>
              <Grid item xs={2}>
                <div className="latest-post-header">Latest Activity</div>
              </Grid>
            </Grid>
          </Box>
          <div className="forums">
            {threadList.map(function (thread, index) {
              const timestamp = new Date(thread.latestActivity);
              let timestring = timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });
              const formattedTimestamp =
                timestring + " " + timestamp.toLocaleDateString();
              return (
                <Box key={thread.id} sx={{ flexGrow: 1 }}>
                  <div
                    className="subforum"
                    key={thread.id}
                    style={{
                      backgroundColor: index % 2 ? "#838530" : "#bdbf3d",
                    }}
                  >
                    <Grid container justifyContent="space-between">
                      <Grid item xs={5}>
                        <div className="header">
                          <div className="navlink">
                            <NavLink
                              to={window.location.pathname + "/" + thread.id}
                            >
                              {thread.title}
                            </NavLink>
                          </div>
                        </div>
                        <div className="description">
                          {thread.postText.slice(0, 30) + "..."}
                        </div>
                      </Grid>
                      <Grid item xs={2}>
                        {thread.threadCreator}
                      </Grid>
                      <Grid item xs={2}>
                        {thread.replies}
                      </Grid>
                      <Grid item xs={2}>
                        <div className="latest-post">{formattedTimestamp}</div>
                      </Grid>
                    </Grid>
                  </div>
                </Box>
              );
            })}
          </div>
          <div className="forums">
            <div className="forum-header-container">Create Thread</div>
            <div className="create-thread-box">
              <form>
                <div>
                  <label>
                    <div>Title</div>
                    <input
                      value={threadTitle}
                      type="text"
                      name="title"
                      onChange={(e) => setThreadTitle(e.target.value)}
                    />
                  </label>
                </div>
                <label>
                  <div>Text</div>
                  <textarea
                    value={threadText}
                    name="text"
                    rows="5"
                    cols="35"
                    wrap="soft"
                    onChange={(e) => setThreadText(e.target.value)}
                  ></textarea>
                </label>
                <div>
                  <button
                    className="styled-button"
                    onClick={(e) => {
                      e.preventDefault();
                      createThread();
                    }}
                  >
                    Submit
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ForumView;
