import React, { useState } from "react";
const Lessons = (props) => {
  const [currentLang, setCurrentLang] = useState(null);

  const [lessonButtons, setLessonButtons] = useState({
    beginner: [],
    intermediate: [],
    advanced: [],
  });

  const LessonButton = ({ className, onClick, text, disabled }) => (
    <button className={className} onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );

  const startQuiz = (_index, _diff) => {
    props.onPassParams({ _index, _diff });
  };

  const allComplete = (difficulty) => {
    if (difficulty === "beginner") return true;
    let allComplete = true;

    if (difficulty === "intermediate") {
      for (
        var i = 0;
        i < props.userLangs[props.currentLang].lessonProg["beginner"].length;
        i++
      ) {
        if (
          props.userLangs[props.currentLang].lessonProg["beginner"][i] !== 100
        )
          allComplete = false;
      }
    } else if (difficulty === "advanced") {
      for (
        var i = 0;
        i <
        props.userLangs[props.currentLang].lessonProg["intermediate"].length;
        i++
      ) {
        if (
          props.userLangs[props.currentLang].lessonProg["intermediate"][i] !==
          100
        )
          allComplete = false;
      }
    }
    return allComplete;
  };

  const createLessonButtons = (lessons, difficulty, onClick, prog) => {
    return lessons.map((lesson, index) => (
      <LessonButton
        key={`lessonbutton-${difficulty}-${index}`}
        className={`lessonbutton-${
          !allComplete(difficulty)
            ? "disabled"
            : prog[index] === 100
              ? "complete"
              : "incomplete"
        }`}
        onClick={() => onClick(index, difficulty.toLowerCase())}
        text={lesson.name + " (" + prog[index] + "%)"}
        disabled={!allComplete(difficulty)}
      />
    ));
  };

  const generateLessonButtons = (lang) => {
    let lessonProg = props.userLangs[lang].lessonProg;

    setLessonButtons({
      ...lessonButtons,
      beginner: createLessonButtons(
        props.langPath.lessons["beginner"],
        "beginner",
        startQuiz,
        lessonProg.beginner,
      ),
      intermediate: createLessonButtons(
        props.langPath.lessons["intermediate"],
        "intermediate",
        startQuiz,
        lessonProg.intermediate,
      ),
      advanced: createLessonButtons(
        props.langPath.lessons["advanced"],
        "advanced",
        startQuiz,
        lessonProg.advanced,
      ),
    });
  };

  if (currentLang !== props.currentLang) {
    setCurrentLang(props.currentLang);
    generateLessonButtons(props.currentLang);
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

  return lessonContainers();
};

export default Lessons;
