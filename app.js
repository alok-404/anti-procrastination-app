class DoItNow {
  constructor() {
    this.container = document.querySelector(".task-list");
    this.inputTask();
    this.tasks = [];

    this.popup = document.querySelector(".popup-overlay");
    this.reasonInput = document.querySelector("#ReasonPopupInput");
    this.saveReasonBtn = document.querySelector("#saveReason");
    this.cancelBtn = document.querySelector("#cancelPopup");

    // this.originalTasks = [];
    this.currentTask = null;

    this.saveReasonBtn.addEventListener("click", () => {
      if (!this.currentTask) return;

      const reason = this.reasonInput.value.trim();

      this.currentTask.reason = reason || "NO reason";
      this.currentTask.status = "skipped";

      clearInterval(this.currentTask.intervalId);
      this.currentTask.intervalId = null;

      this.closePopup();
      this.renderTask();
    });
    this.cancelBtn.addEventListener("click", () => {
      this.closePopup();
    });
  }
  inputTask() {
    // console.log("dom");
    const taskInput = document.querySelector(".task-input input");
    const taskAddBtn = document.querySelector(".task-input .add-btn");
    taskAddBtn.addEventListener("click", () => {
      const task = taskInput.value.trim();
      if (task.length === 0 || task.length < 3) {
        alert("Invalid Input");
        return;
      }

      this.addTask(task);
    });
  }
  init() {
    console.log("start");
  }
  addTask(task) {
    console.log(task);
    const newTask = {
      id: Date.now(),
      task,
      status: "pending",
      timeLeft: 300,
      intervalId: null,
      reason: null,
    };
    // console.log(this.tasks.length);

    if (this.tasks.length > 5) {
      alert("You can add 5 Task only wrna tu procastinating krega");
      return;
    }
    this.tasks.push(newTask);

    // this.originalTasks = [...this.tasks];

    console.log(this.tasks);
    // console.log(this.originalTasks);
    this.renderTask();
  }
  renderTask(tasks = this.tasks) {
    this.container.innerHTML = "";

    if (tasks.length === 0) {
      this.container.innerHTML = "No Task found";
      return;
    }

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("task-card");
      card.dataset.id = task.id;

      // Text
      const text = document.createElement("span");
      text.classList.add("task-text");
      text.textContent = task.task;

       if (task.status === "done"){
        text.classList.add("completed")
       }

      

      // ✅ Timer
      const timer = document.createElement("div");
      timer.classList.add("timer");

      // Default 5 min
      if (task.status === "in-progress") {
        timer.textContent = this.formatTime(task.timeLeft);
          card.classList.add("in-progress");
      } else {
        timer.style.display = "none";
      }

      // Button container
      const btnContainer = document.createElement("div");
      btnContainer.classList.add("task-buttons");

      const startBtn = document.createElement("button");
      startBtn.classList.add("start-btn");
      startBtn.textContent = "Start";

      startBtn.addEventListener("click", (e) => {
        // console.log("hello");
        e.stopPropagation();
        this.timerLogic(task);
      });

      const doneBtn = document.createElement("button");
      doneBtn.classList.add("done-btn");
      doneBtn.textContent = "Done";

      doneBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        task.status = "done";

        clearInterval(task.intervalId);
        task.intervalId = null;

        this.renderTask();
      });

     

      const skipBtn = document.createElement("button");
      skipBtn.classList.add("skip-btn");
      skipBtn.textContent = "Skip";

      skipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.openPopUp(task);
      });

   
 if (task.status === "done") {
        doneBtn.textContent = "You did it";
        doneBtn.style.backgroundColor = "grey";

        startBtn.style.display = "none";
        skipBtn.style.display = "none";
      }
      btnContainer.append(startBtn, doneBtn, skipBtn);

      // Append
      card.append(text, timer, btnContainer);
      this.container.appendChild(card);

      // // 👉 Popup
      // card.addEventListener("click", (e) => {
      //   if (e.target.tagName === "BUTTON") return;
      //   this.openPopup(task);
      // });
    });
  }
  timerLogic(task) {
    // console.log(task);

    this.tasks.forEach((t) => {
      if (t.intervalId) {
        clearInterval(t.intervalId);
        t.intervalId = null;
        t.status = "pending";
      }
    });

    task.status = "in-progress";
    document.querySelector(".task-card").classList.add("in-progress");
    task.intervalId = setInterval(() => {
      task.timeLeft--;

      if (task.timeLeft <= 0) {
        clearInterval(task.intervalId);
        task.intervalId = null;
        task.status = "done";
      }

      this.renderTask(); // update UI every second
    }, 1000);

    this.renderTask();
  }

  formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  openPopUp(task) {
    this.popup.style.display = "flex";
    this.reasonInput.value = "";
    this.currentTask = task;
  }

  closePopup() {
    this.popup.style.display = "none";
    this.currentTask = null;
  }
}

let app = new DoItNow();
app.init();

// function buttonWork() {
//   const taskCards = document.querySelectorAll(".task-card");
//   const popup = document.getElementById("taskPopup");
//   const popupInput = document.getElementById("popupTaskInput");
//   const closeBtn = document.getElementById("closeBtn");

//   taskCards.forEach((card) => {
//     card.addEventListener("click", () => {
//       popup.style.display = "flex";
//       popupInput.value = card.querySelector(".task-text").textContent;
//       // You can store the task id if needed
//       popup.dataset.currentTaskId = card.dataset.id;
//     });
//   });

//   closeBtn.addEventListener("click", () => {
//     popup.style.display = "none";
//   });
// }

// buttonWork();
