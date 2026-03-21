class AntiProcastinationApp {
  constructor() {
    this.container = document.querySelector(".task-list");
    this.popup = document.querySelector(".popup-overlay");
    this.reasonInput = document.querySelector("#ReasonPopupInput");
    this.saveReasonBtn = document.querySelector("#saveReason");
    this.cancelBtn = document.querySelector("#cancelPopup");

    this.saveReasonBtn.addEventListener("click", () => {
      if (!this.currentTask) return;

      const reason = this.reasonInput.value.trim();

      this.currentTask.reason = reason || "no reason";
      this.currentTask.status = "skipped";
      this.saveToLocalStorage();

      clearInterval(this.currentTask.intervalID);
      this.currentTask.intervalID = null;

      this.closePopup();
      this.renderTasks();
    });
    this.cancelBtn.addEventListener("click", () => {
      this.closePopup();
    });

    this.tasks = [];
    this.currentTask = null;
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

    console.log("app started");
    this.renderTasks();
    this.inputTask();
  }
  inputTask() {
    const taskInput = document.querySelector(".task-input input");
    const taskAddBtn = document.querySelector(".task-input .add-btn");

    taskAddBtn.addEventListener("click", () => {
      const task = taskInput.value.trim();

      if (task.length < 3 || task.length === 0) {
        alert("Invalid Input");
        return;
      }
      // console.log(task);
      this.addTask(task);
    });
  }
  addTask(task) {
    // console.log("add task = " + task );

    const newTask = {
      id: Date.now(),
      task,
      status: "pending",
      reason: null,
      timeLeft: 300,
      intervalID: null,
    };

    if (this.tasks.length >= 5) {
      alert("You can add only 5 tasks wrna tu procastinate krega");
      return;
    }

    this.tasks.push(newTask);
    // console.log(newTask);

    this.saveToLocalStorage();
    this.renderTasks();
  }

  //   renderTasks(tasks = this.tasks) {
  //     this.container.innerHTML = "";
  //     // console.log(tasks);
  //     tasks.forEach((task) => {
  //       const card = document.createElement("div");
  //       card.classList.add("task-card");
  //       card.dataset.id = task.id;

  //       // Text
  //       const text = document.createElement("span");
  //       text.classList.add("task-text");
  //       text.textContent = task.task;

  //       if (task.status === "done") {
  //         text.classList.add("completed");
  //       }

  //       // ✅ Timer
  //       const timer = document.createElement("div");
  //       timer.classList.add("timer");

  //       if (task.status === "in-progress") {
  //         timer.textContent = this.formatTime(task.timeLeft);
  //         card.classList.add("in-progress");
  //       } else {
  //         timer.style.display = "none";
  //       }

  //       // Button container
  //       const btnContainer = document.createElement("div");
  //       btnContainer.classList.add("task-buttons");

  //       const startBtn = document.createElement("button");
  //       startBtn.classList.add("start-btn");
  //       startBtn.textContent = "Start";

  //       startBtn.addEventListener("click", (e) => {
  //         e.stopPropagation();
  //         this.timerLogic(task);
  //       });
  //       if (task.status === "in-progress") {
  //         startBtn.textContent = "Pause";
  //       } else if (task.status === "paused") {
  //         startBtn.textContent = "Resume";
  //       } else {
  //         startBtn.textContent = "Start";
  //       }

  //       const doneBtn = document.createElement("button");
  //       doneBtn.classList.add("done-btn");
  //       doneBtn.textContent = "Done";

  //       doneBtn.addEventListener("click", (e) => {
  //         e.stopPropagation();
  //         this.doneBtnLogic(task);
  //       });

  //       const menuBtn = document.createElement("button");
  //       menuBtn.textContent = "⋮";
  //       menuBtn.classList.add("menu-btn");

  //       const menu = document.createElement("div");
  //       menu.classList.add("dropdown-menu");

  //       menu.innerHTML = `
  //   <button class="skip-option">Skip</button>
  //   <button class="edit-option">Edit</button>
  //   <button class="delete-option">Delete</button>
  // `;

  //       menuBtn.addEventListener("click", (e) => {
  //         e.stopPropagation();
  //         menu.classList.toggle("show");
  //       });

  //       menu.querySelector(".skip-option").onclick = () => {
  //         this.openPopUp(task);
  //       };

  //       menu.querySelector(".edit-option").onclick = () => {
  //         console.log("edit clicked"); // abhi placeholder
  //       };

  //       menu.querySelector(".delete-option").onclick = () => {
  //         this.tasks = this.tasks.filter((t) => t.id !== task.id);
  //         this.renderTasks();
  //       };

  //       const skipBtn = document.createElement("button");
  //       skipBtn.classList.add("skip-btn");
  //       skipBtn.textContent = "Skip";

  //       skipBtn.addEventListener("click", (e) => {
  //         e.stopPropagation();

  //         this.openPopUp(task);
  //       });

  //       if (task.status === "done") {
  //         doneBtn.textContent = "You did it";
  //         doneBtn.style.backgroundColor = "grey";
  //         startBtn.style.display = "none";
  //         skipBtn.style.display = "none";
  //       }
  //       btnContainer.append(startBtn, doneBtn, menuBtn);

  //       // Append
  //       card.append(text, timer, btnContainer, menu);
  //       this.container.appendChild(card);

  //       // 👉 Popup
  //       // card.addEventListener("click", (e) => {
  //       //   if (e.target.tagName === "BUTTON") return;
  //       //   this.openPopup(task);
  //       // });
  //     });
  //   }

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

      if (task.status === "done" || task.status === "skip") {
        text.classList.add("completed");
      }

      // TIMER
      const timer = document.createElement("div");
      timer.classList.add("timer");

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
        this.doneBtnLogic(task);
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
        this.openPopUp(task);
      });

      menu.querySelector(".edit-option").addEventListener("click", () => {
        console.log("edit clicked"); // next step me implement karenge
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
        btnContainer.innerHTML = "Skipped";
        doneBtn.style.display = "none";
        text.classList.add("completed");
      }

      // APPEND BUTTONS
      btnContainer.append(startBtn, doneBtn, menuBtn);

      // APPEND ALL
      card.append(text, timer, btnContainer, menu);
      this.container.appendChild(card);
    });

    // CLICK OUTSIDE → CLOSE ALL MENUS
    document.addEventListener("click", () => {
      document.querySelectorAll(".dropdown-menu").forEach((m) => {
        m.classList.remove("show");
      });
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
        this.saveToLocalStorage();

        task.intervalID = null;
      }

      this.renderTasks();
    }, 1000);

    this.saveToLocalStorage();

    this.renderTasks();
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

    this.renderTasks();
  }

  openPopUp(task) {
    console.log(task);

    this.popup.style.display = "flex";
    this.reasonInput.value = "";
    this.currentTask = task;
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
