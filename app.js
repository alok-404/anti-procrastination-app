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
        streakCounted: false,
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

        this.showMessage(this.getRandomMessage("skip"), "error");
        clearInterval(this.currentTask.intervalID);
        this.currentTask.intervalID = null;

        this.score -= 10;
        this.daily.completedToday--;
        if (this.score < 0) this.score = 0;

        localStorage.setItem("scores", JSON.stringify(this.score));
        this.scoreHTML.innerHTML = this.score;
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

    const headerDate = document.querySelector(".day-timer p");
    if (headerDate) {
      headerDate.textContent = this.daily.date;
    }
    this.tasks.forEach((task) => {
      task.intervalID = null; // clean always
    });

    this.resetDayIfNeeded();

    document.getElementById("todayCount").textContent =
      this.daily.completedToday;

    document.getElementById("streak").textContent = this.daily.streak;

    this.streakRiskLogic();
    this.renderTasks();
    this.inputTask();
    this.startDayCountdown();
    if (this.daily.completedToday === 0) {
      this.showMessage("Aaj bhi zero? Fir se?", "error");
    }
    if (this.daily.completedToday === 4) {
      this.showMessage("Bas 1 aur. Don't mess this up.", "success");
    }
  }
  inputTask() {
    const taskInput = document.querySelector(".task-input input");
    const taskAddBtn = document.querySelector(".task-input .add-btn");
    let selectedTime = 5;

    document.querySelectorAll(".time-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        selectedTime = parseInt(btn.dataset.time);
      });
    });

    taskAddBtn.addEventListener("click", () => {
      const task = taskInput.value.trim();

      if (task.length < 3) {
        this.showMessage("Task bahut chota hai", "error");
        return;
      }

      // console.log(selectedTime);
      this.addTask(task, selectedTime);
      taskInput.value = "";
    });
  }
  addTask(task, minutes) {
    // console.log("add task = " + task );

    if (this.tasks.length >= 5) {
      this.showMessage(
        "5 se zyada task add karega toh kaam kab karega?",
        "error",
      );
      return;
    }

    if (minutes === 60 && this.score < 50) {
      this.showMessage("60 min unlock karne ke liye 50 score chahiye", "error");
      return;
    }

    const newTask = {
      id: Date.now(),
      task,
      status: "pending",
      reason: null,
      timeLeft: minutes * 60,
      duration: minutes * 60,
      createdAt: Date.now(),
      intervalID: null,
      startedAt: null,
    };
    this.tasks.push(newTask);
    // console.log(newTask);

    this.saveToLocalStorage();
    this.renderTasks();
  }

  renderTasks(tasks = this.tasks) {
    if (tasks.length === 0) {
      this.container.innerHTML = `<div class="empty-state">
       <img src="images/tkthao219-bubududu.gif" alt="" srcset="">
      No tasks. Add one.
      </div>`;
      return;
    }
    this.container.innerHTML = "";

    tasks.forEach((task) => {
      const card = document.createElement("div");
      card.classList.add("task-card");
      card.dataset.id = task.id;

      // TEXT
      const text = document.createElement("span");
      text.classList.add("task-text");
      text.textContent = task.task;

      if (task.status === "done") {
        text.classList.add("completed");
      }
      if (task.status === "skipped") {
        text.classList.add("skipped-text");
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

        if (task.status !== "ready-to-complete") {
          this.showMessage("Pehle timer complete kar", "error");
          return;
        }

        if (task.status === "done") return;

        this.doneBtnLogic(task);

        this.daily.completedToday++;

        if (this.daily.completedToday === 5 && !this.daily.streakCounted) {
          this.daily.streak++;
          this.daily.streakCounted = true;
        }

        localStorage.setItem("daily", JSON.stringify(this.daily));

        this.score += 10;
        localStorage.setItem("scores", JSON.stringify(this.score));

        this.scoreHTML.innerHTML = this.score;
        document.getElementById("todayCount").textContent =
          this.daily.completedToday;
        document.getElementById("streak").textContent = this.daily.streak;
        this.saveToLocalStorage();
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
        if (task.status === "in-progress") {
          this.showMessage("Task running hai. Skip nahi kar sakta", "error");
          return;
        }

        if (task.timeLeft === task.duration) {
          this.showMessage("Start toh kar pehle", "error");
          return;
        }

        let minWait = 60000; // default 1 min

        if (this.score >= 50) minWait = 300000; // 5 min
        if (this.score >= 150) minWait = 600000; // 10 min

        const timePassed = Date.now() - (task.startedAt || task.createdAt);

        if (timePassed < minWait) {
          this.showMessage(`At least try ${minWait / 60000} min`, "error");
          return;
        }

        menu.classList.remove("show");
        this.openPopUp(task, "skip");
      });
      menu.querySelector(".edit-option").addEventListener("click", () => {
        menu.classList.remove("show");
        this.openPopUp(task, "edit");
        this.saveReasonBtn.textContent = "Save Changes";
      });

      menu.querySelector(".delete-option").addEventListener("click", () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
        this.saveToLocalStorage();

        this.renderTasks();
      });

      // DONE STATE UI
      if (task.status === "ready-to-complete") {
        startBtn.style.display = "none";
        doneBtn.style.backgroundColor = "orange";
        doneBtn.textContent = "Complete Now";
        card.classList.add("ready");
      }
      if (task.status === "done") {
        btnContainer.innerHTML = "<span>Done ✅</span>";
        doneBtn.style.display = "none";
        startBtn.style.display = "none";
        menuBtn.style.display = "none";
      } else if (task.status === "skipped") {
        startBtn.style.display = "none";
        menuBtn.style.display = "none";
        btnContainer.innerHTML = `<span>Skipped: ${task.reason}</span>`;
        card.classList.add("skipped-card");
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

    if (task.duration >= 3600 && task.status === "pending") {
      const confirmStart = confirm("60 min deep work. Sure?");
      if (!confirmStart) return;
    }

    //start/resume

    if (!task.startedAt) {
      task.startedAt = Date.now();
    }
    task.status = "in-progress";
    this.saveToLocalStorage();

    task.intervalID = setInterval(() => {
      task.timeLeft--;

      if (task.timeLeft <= 0) {
        clearInterval(task.intervalID);
        task.status = "ready-to-complete";
        task.intervalID = null;
        this.showMessage("Time up. Finish it.", "success");

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
    this.showMessage(this.getRandomMessage("done"), "success");
    clearInterval(task.intervalID);
    task.intervalID = null;
    this.streakRiskLogic();
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
    this.saveReasonBtn.textContent = "Save";
  }

  saveToLocalStorage() {
    const cleanTasks = this.tasks.map(({ intervalID, ...rest }) => rest);
    localStorage.setItem("tasks", JSON.stringify(cleanTasks));
  }

  resetDayIfNeeded() {
    const today = new Date().toDateString();
    const lastDate = new Date(this.daily.date);
    const currentDate = new Date(today);

    const diffDays = Math.floor(
      (currentDate - lastDate) / (1000 * 60 * 60 * 24),
    );

    if (diffDays >= 1) {
      const prevCompleted = this.daily.completedToday;

      // 🔥 result based on last active day
      if (prevCompleted === 5 && diffDays === 1) {
        this.showMessage("Streak maintained 🔥", "success");
      } else {
        this.showMessage("Discipline break ho gaya.", "error");
        this.daily.streak = 0;
      }

      // 🔥 reset day
      this.daily = {
        date: today,
        completedToday: 0,
        streak: this.daily.streak,
        streakCounted: false,
      };

      this.tasks = [];
      localStorage.removeItem("tasks");

      localStorage.setItem("daily", JSON.stringify(this.daily));
    }
  }

  getDayResult() {
    if (this.daily.completedToday === 5) {
      this.showMessage("Streak maintained 🔥", "success");
    } else {
      this.showMessage("Discipline break ho gaya.", "error");
    }
  }

  showMessage(text, type = "normal") {
    const msg = document.getElementById("message");
    msg.textContent = text;

    msg.style.color =
      type === "error" ? "red" : type === "success" ? "lightgreen" : "#fff";

    clearTimeout(this.msgTimeout);

    this.msgTimeout = setTimeout(() => {
      msg.textContent = "";
    }, 10000);
  }

  getRandomMessage(type) {
    const messages = {
      skip: [
        "Fir bhag gaya...",
        "Easy way out again?",
        "Discipline zero hai kya?",
        "Khud se jhoot bol raha hai tu?",
        "Hogayi reels motivation khatam?",
      ],
      done: [
        "Good job 🔥",
        "Aaj kuch toh kiya tune",
        "Keep going 💪",
        "Aaj improve hua hai tu",
        "ye huii na baat, Good",
      ],
    };

    const arr = messages[type];
    return arr[Math.floor(Math.random() * arr.length)];
  }

  streakRiskLogic() {
    let message = "";
    let type = "normal";

    if (this.daily.completedToday === 0) {
      message = "Aaj bhi zero?";
      type = "error";
    } else if (this.daily.completedToday === 2) {
      message = "Still behind";
      type = "error";
    } else if (this.daily.completedToday === 4) {
      message = "Last one. Don't mess this up";
      type = "success";
    } else if (this.daily.completedToday < 5) {
      message = "Streak in danger";
      type = "error";
    }

    if (message) {
      this.showMessage(message, type);
    }
  }

  startDayCountdown() {
    const timerEl = document.getElementById("dayTimer");
    const container = document.querySelector(".day-timer");

    const update = () => {
      const now = new Date();

      const end = new Date();
      end.setHours(24, 0, 0, 0);

      const diff = end - now;

      if (diff <= 0) {
        timerEl.textContent = "00:00:00";
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);

      timerEl.textContent = `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

      // 💀 PRESSURE LEVELS
      if (hrs <= 3) {
        container.classList.add("danger");
      }

      if (hrs === 0 && mins <= 30) {
        container.classList.add("critical");
      }

     if (hrs === 0 && mins === 10 && secs === 0) {
  this.showMessage("Last 10 min. Finish or lose the day.", "error");
}
    };

    update();
    setInterval(update, 1000);
  }
}

const app = new AntiProcastinationApp();
app.init();
