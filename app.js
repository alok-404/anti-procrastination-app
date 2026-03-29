class AntiProcastinationApp {
  constructor() {
    this.tasks = [];
    this.currentTask = null;
    this.mode = null;

    this.daily = JSON.parse(localStorage.getItem("daily"));

    if (!this.daily || !this.daily.date) {
      this.daily = {
        date: new Date().toDateString(),
        completedToday: 0,
        streak: 0,
      };
    }

    this.score = JSON.parse(localStorage.getItem("scores")) || 0;
    console.log(this.score);

    this.container = document.querySelector(".task-list");
    this.popup = document.querySelector(".popup-overlay");
    this.reasonInput = document.querySelector("#ReasonPopupInput");
    this.saveReasonBtn = document.querySelector("#saveReason");
    this.cancelBtn = document.querySelector("#cancelPopup");

    this.scoreHTML = document.querySelector("#score");

    this.saveReasonBtn.addEventListener("click", () => {
      if (!this.currentTask) return;
      const value = this.reasonInput.value.trim();

      if (this.mode === "skip") {
        this.currentTask.reason = value || "no reason";
        this.currentTask.status = "skipped";

        clearInterval(this.currentTask.intervalID);
        this.currentTask.intervalID = null;
      }
      if (this.mode === "edit") {
        if (value.length < 3) {
          alert("Task too short");
          return;
        }
        this.currentTask.task = value;
      }

      this.saveToLocalStorage();
      this.closePopup();
      this.renderTasks();
    });
    this.cancelBtn.addEventListener("click", () => {
      this.closePopup();
    });

    // CLICK OUTSIDE → CLOSE ALL MENUS
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-menu").forEach((m) => {
        m.classList.remove("show");
      });
    });
  }
  init() {
    const data = localStorage.getItem("tasks");
    this.tasks = data ? JSON.parse(data) : [];

    this.tasks.forEach((task) => {
      if (task.status === "in-progress") {
        task.status = "paused";
        task.intervalID = null;
      }
    });

    this.scoreHTML.innerHTML = this.score;

    console.log("app started");

    const today = new Date().toDateString();

    if (this.daily.date !== today) {
      if (this.daily.completedToday < 5) {
        this.daily.streak = 0; // break streak
      }

      this.daily.completedToday = 0;
      this.daily.date = today;

      localStorage.setItem("daily", JSON.stringify(this.daily));
    }

    document.getElementById("todayCount").textContent =
      this.daily.completedToday;

    document.getElementById("streak").textContent = this.daily.streak;

   const headerDate = document.querySelector(".header p");
if (headerDate) {
  headerDate.textContent = this.daily.date;
}

    this.renderTasks();
    this.inputTask();
    // console.log(this.daily);
  }
  inputTask() {
    const taskInput = document.querySelector(".task-input input");
    const taskAddBtn = document.querySelector(".task-input .add-btn");

    taskAddBtn.addEventListener("click", () => {
      const task = taskInput.value.trim();

      if (task.length < 3) {
        alert("Invalid Input");
        return;
      }
      // console.log(task);
      this.addTask(task);
      taskInput.value = "";
    });
  }
  addTask(task) {
    // console.log("add task = " + task );

    if (this.tasks.length >= 5) {
      alert("You can add only 5 tasks wrna tu procastinate krega");
      return;
    }

    const newTask = {
      id: Date.now(),
      task,
      status: "pending",
      reason: null,
      timeLeft: 300,
      intervalID: null,
    };
    this.tasks.push(newTask);
    // console.log(newTask);

    this.saveToLocalStorage();
    this.renderTasks();
  }

  renderTasks(tasks = this.tasks) {
    this.container.innerHTML = "";

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("task-card");
      card.dataset.id = task.id;

      // TEXT
      const text = document.createElement("span");
      text.classList.add("task-text");
      text.textContent = task.task;

      if (task.status === "done" || task.status === "skipped") {
        text.classList.add("completed");
      }

      // TIMER
      const timer = document.createElement("div");
      timer.classList.add("timer");
      timer.dataset.id = task.id;

      if (task.status === "in-progress") {
        timer.textContent = this.formatTime(task.timeLeft);
        card.classList.add("in-progress");
      } else {
        timer.style.display = "none";
      }

      // BUTTON CONTAINER
      const btnContainer = document.createElement("div");
      btnContainer.classList.add("task-buttons");

      // START BUTTON
      const startBtn = document.createElement("button");
      startBtn.classList.add("start-btn");

      if (task.status === "in-progress") {
        startBtn.textContent = "Pause";
      } else if (task.status === "paused") {
        startBtn.textContent = "Resume";
      } else {
        startBtn.textContent = "Start";
      }

      startBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.timerLogic(task);
      });

      // DONE BUTTON
      const doneBtn = document.createElement("button");
      doneBtn.classList.add("done-btn");
      doneBtn.textContent = "Done";

      doneBtn.addEventListener("click", (e) => {
        e.stopPropagation();


        if (task.timeLeft > 0) {
          alert("Complete the timer first!");
          return;
        }

        if (task.status === "done") return;


        this.doneBtnLogic(task);

        this.daily.completedToday++;

        if (this.daily.completedToday === 5) {
          this.daily.streak++;
        }

        localStorage.setItem("daily", JSON.stringify(this.daily));

        this.score += 10;
        localStorage.setItem("scores", JSON.stringify(this.score));


        this.scoreHTML.innerHTML = this.score;
        document.getElementById("todayCount").textContent =
          this.daily.completedToday;
        document.getElementById("streak").textContent = this.daily.streak;

        this.renderTasks(); 
      });

      // THREE DOT BUTTON
      const menuBtn = document.createElement("button");
      menuBtn.textContent = "⋮";
      menuBtn.classList.add("menu-btn");

      // DROPDOWN MENU
      const menu = document.createElement("div");
      menu.classList.add("dropdown-menu");

      menu.innerHTML = `
      <button class="skip-option">Skip</button>
      <button class="edit-option">Edit</button>
      <button class="delete-option">Delete</button>
    `;

      // TOGGLE MENU
      menuBtn.addEventListener("click", (e) => {
        e.stopPropagation();

        // close other menus
        document.querySelectorAll(".dropdown-menu").forEach((m) => {
          if (m !== menu) m.classList.remove("show");
        });

        menu.classList.toggle("show");
      });

      // MENU ACTIONS
      menu.querySelector(".skip-option").addEventListener("click", () => {
        menu.classList.remove("show");
        this.openPopUp(task, "skip");
      });

      menu.querySelector(".edit-option").addEventListener("click", () => {
        menu.classList.remove("show");
        this.openPopUp(task, "edit");
        this.saveReasonBtn.textContent =
          this.mode === "edit" ? "Save Changes" : "Save";
      });

      menu.querySelector(".delete-option").addEventListener("click", () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.saveToLocalStorage();

        this.renderTasks();
      });

      // DONE STATE UI
      if (task.status === "done") {
        doneBtn.textContent = "You did it";
        doneBtn.style.backgroundColor = "grey";
        startBtn.style.display = "none";
        menuBtn.style.display = "none";
      } else if (task.status === "skipped") {
        startBtn.style.display = "none";
        menuBtn.style.display = "none";
        btnContainer.textContent = `Skipped: ${task.reason}`;
        doneBtn.style.display = "none";
        text.classList.add("completed");
      }

      // APPEND BUTTONS
      btnContainer.append(startBtn, doneBtn, menuBtn);

      // APPEND ALL
      card.append(text, timer, btnContainer, menu);
      this.container.appendChild(card);
    });
  }
  timerLogic(task) {
    //pause krega timer ko
    if (task.intervalID) {
      clearInterval(task.intervalID);
      task.intervalID = null;
      task.status = "paused";
      this.renderTasks();
      return;
    }

    //stop other timers
    this.tasks.forEach((t) => {
      if (t.intervalID) {
        //because setInterval always gives u id
        clearInterval(t.intervalID);
        t.status = "paused";
        t.intervalID = null;
      }
    });

    //start/resume
    task.status = "in-progress";
    this.saveToLocalStorage();

    task.intervalID = setInterval(() => {
      task.timeLeft--;

      if (task.timeLeft <= 0) {
        clearInterval(task.intervalID);
        task.status = "done";
        task.intervalID = null;

        this.saveToLocalStorage();
        this.renderTasks(); // only once when done
        return;
      }

      this.updateTimerUI(task);
    }, 1000);

    this.saveToLocalStorage();

    this.renderTasks();
  }
  updateTimerUI(task) {
    const timerEl = document.querySelector(`.timer[data-id="${task.id}"]`);
    if (timerEl) {
      timerEl.textContent = this.formatTime(task.timeLeft);
    }
  }

  formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  }

  doneBtnLogic(task) {
    task.status = "done";

    clearInterval(task.intervalID);
    task.intervalID = null;
    this.saveToLocalStorage();


  }

  openPopUp(task, mode = "skip") {
    this.popup.style.display = "flex";
    this.currentTask = task;
    this.mode = mode;

    if (mode === "skip") {
      this.reasonInput.value = "";
      this.reasonInput.placeholder = "Why are you skipping?";
    }

    if (mode === "edit") {
      this.reasonInput.value = task.task;
      this.reasonInput.placeholder = "Edit your task";
    }
  }

  closePopup() {
    this.popup.style.display = "none";
    this.currentTask = null;
  }

  saveToLocalStorage() {
    localStorage.setItem("tasks", JSON.stringify(this.tasks));
  }
}

const app = new AntiProcastinationApp();
app.init();
