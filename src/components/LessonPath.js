import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getDatabase, get, ref, set, update, onValue } from "firebase/database";
import "./VocabLesson.css";
import "../App.css";
import NavBar from "./NavBar";
import Footer from "./Footter";
import { LangPath, UserLangs } from "./LangPath";

const LessonPath = (_language) => {
  const [langPathSelected, setLangPathSelected] = useState(null);
  const [langPath, setLangPath] = useState(null);
  const [lessonsLoaded, setLessonsLoaded] = useState(false);

  const [lessonButtons, setLessonButtons] = useState({
    beginner: [],
    intermediate: [],
    advanced: [],
  });

  const [flagMenu, setFlagMenu] = useState(false);
  const [userLangs, setUserLangs] = useState({});
  const [loaded, setLoaded] = useState(false);

  const db = getDatabase();
  const auth = getAuth();

  const redirect = useNavigate();
  const flagsAPI = "https://flagsapi.com/";
  const flagStyle = "/flat/64.png";

  const LessonButton = ({ key, className, onClick, text }) => (
    <button key={key} className={className} onClick={onClick}>
      {text}
    </button>
  );

  const toggleDropdown = () => {
    setFlagMenu(!flagMenu);
  };

  const startLesson = (_index, _diff) => {
    redirect(
      `/LessonPage?lang=` +
        langPath.lang +
        "&diff=" +
        _diff +
        "&index=" +
        _index,
    );
  };

  const createLessonButtons = (lessons, difficulty, onClick) => {
    return lessons.map((lesson, index) => (
      <LessonButton
        key={`lessonbutton-${difficulty}-${index}`}
        className={`lessonbutton-${difficulty.toLowerCase()}`}
        onClick={() => onClick(index, difficulty.toLowerCase())}
        text={lesson.name}
      />
    ));
  };

  const getPathLessons = () => {
    setLessonButtons({
      ...lessonButtons,
      beginner: createLessonButtons(
        langPath.lessons["beginner"],
        "complete",
        startLesson,
      ),
      intermediate: createLessonButtons(
        langPath.lessons["intermediate"],
        "incomplete",
        startLesson,
      ),
      advanced: createLessonButtons(
        langPath.lessons["advanced"],
        "disabled",
        startLesson,
      ),
    });

    setLessonsLoaded(true);
    setLoaded(true);
  };

  const getCurrentLangPath = () => {
    const userId = auth.currentUser.uid;

    onAuthStateChanged(auth, (user) => {
      if (user) {
        get(ref(db, "/users/" + userId)).then((snapshot) => {
          if (!snapshot.val().langs) {
            //for some reason this fails, mby db conn is not ready on the first round
            return null;
          } else {
            setLangPath(new LangPath(snapshot.val().currentLang));
            console.log(snapshot.val().currentLang);
            if (snapshot.val().currentLang !== undefined) {
              console.log("älä");
              setLangPathSelected(true);
            }
            return snapshot.val().currentLang;
          }
        });
      }
    });
  };

  useEffect(() => {
    const connectedRef = ref(db, ".info/connected");

    onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        if (langPath === null) {
          if (langPathSelected === null) {
            // get current langpath from database
            let currLang = getCurrentLangPath();
            if (currLang === undefined) {
              console.log("User is learning no languages");
              setLoaded(true);
            } else {
              setLangPath(new LangPath(currLang));
              setLangPathSelected(true);
            }
          } else if (langPathSelected === false) {
            console.log("Lang path not selected");
          }

          // if no langpath in db
          setLangPathSelected(false);
        }
      }
    });
  }, []);

  if (langPathSelected && !lessonsLoaded) {
    getPathLessons();
  } else {
    console.log("langpathselected " + langPathSelected);
  }

  const lessonContainers = () => {
    return (
      <>
        <div className="lessoncontainer">
          <div className="greycontainer">
            <div className="difficulty-title">Beginner</div>
            <div className="dashline" />
            <div>{lessonButtons.beginner}</div>
          </div>
        </div>

        <div className="lessoncontainer">
          <div className="greycontainer">
            <div className="difficulty-title">Intermediate</div>
            <div className="dashline" />
            <div>{lessonButtons.intermediate}</div>
          </div>
        </div>

        <div className="lessoncontainer">
          <div className="greycontainer">
            <div className="difficulty-title">Advanced</div>
            <div className="dashline" />
            <div>{lessonButtons.advanced}</div>
          </div>
        </div>
      </>
    );
  };

  const setLang = (lang) => {
    const userId = auth.currentUser.uid;

    onAuthStateChanged(auth, (user) => {
      //check if langpath in db, if not, create
      if (user) {
        get(ref(db, "/users/" + userId)).then((snapshot) => {
          if (!snapshot.val().langs) {
            console.log("No langs in db, creating");
            setUserLangs([0]);
            let path = new UserLangs(lang);
            setLangPath(new LangPath(lang));
            setLangPathSelected(true);

            update(ref(db, "/users/" + userId), {
              langs: [path],
              currentLang: lang,
            });
          } else {
            setUserLangs(snapshot.val().langs);
            setLangPath(new LangPath(lang));
            update(ref(db, "/users/" + userId), {
              currentLang: lang,
            });
          }
        });
      }
      setLangPath(new LangPath(lang));
      setLangPathSelected(true);
    });

    if (flagMenu) toggleDropdown();
    setLessonsLoaded(false);
  };

  const getLangFlags = () => {
    //get these from some db
    let langs = ["FI", "ES"];

    let langFlags = [];

    for (let i = 0; i < langs.length; i++) {
      langFlags.push(
        <button
          key={"lang" + i}
          className="btn"
          onClick={() => setLang(langs[i])}
        >
          <img src={flagsAPI + langs[i] + flagStyle} />
        </button>,
      );
    }

    return langFlags;
  };

  const langDropDown = () => {
    //get these from some db
    let langs = ["FI", "ES"];

    let langFlags = [];

    var exclude = 0;

    for (let i = 0; i < langs.length; i++) {
      if (langPath.lang === langs[i]) {
        exclude = i;
        break;
      }
    }

    for (let i = 0; i < langs.length; i++) {
      if (i != exclude) {
        langFlags.push(
          <p key={"dropdownflag" + i}>
            <button
              key={"lang" + i}
              className="btn"
              onClick={() => setLang(langs[i])}
            >
              <img src={flagsAPI + langs[i] + flagStyle} />
            </button>
          </p>,
        );
      }
    }
    return (
      <>
        <button className="btn" onClick={toggleDropdown}>
          {" "}
          <img src={flagsAPI + langPath.lang + flagStyle} />
        </button>

        <div className="flag-dropdown-container">
          {flagMenu && <div className="flag-dropdown-content">{langFlags}</div>}
        </div>
      </>
    );
  };

  const lessonsTitle = () => {
    if (loaded) {
      return (
        <div className="lessonstitle">
          LESSONS &gt;&gt;
          <span className="language-title">
            {" "}
            {langPathSelected === false
              ? "No language chosen"
              : langPath.langDesc}
          </span>
          {langPathSelected === false ? "" : langDropDown()}
        </div>
      );
    }
  };

  const languageSelection = () => {
    if (loaded) {
      return (
        <div className="lessoncontainer">
          <div className="greycontainer">
            <div className="difficulty-title">Please choose a language</div>
            <div className="dashline" />
            <div>
              Start learning new languages now!!!!!!!{" "}
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCqiP3Z1VUfzab1N2SpD1IJhzfkyuN3TjmT8jyseqS&s" />
            </div>
            <div>{getLangFlags()}</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div>
      <NavBar />
      <div className="pagecontainer">
        <div className="dashboardelements">
          <div className="boxcontainer">{lessonsTitle()}</div>
        </div>

        <div className="lessonselements">
          {langPathSelected ? lessonContainers() : languageSelection()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default LessonPath;
