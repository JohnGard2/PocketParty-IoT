/**
 * Game 1: Red Light, Green Light (ไฟเขียว ไฟแดง)
 * กติกา: ปัดมือวิ่งตอนไฟเขียว หากปัดมือตอนไฟแดงจะโดนหักก้าวถอยหลัง!
 */
const GameRun = {
  id: "RUN_RACE",
  title: "🚦 ไฟเขียว ไฟแดง (Red Light, Green Light)",
  arduinoMode: "RUN",

  targetSteps: 30,
  p1Steps: 0,
  p2Steps: 0,
  callbacks: null,
  isEnded: false,
  isGreenLight: true,
  trafficTimer: null,

  init(containerEl, config) {
    this.p1Steps = 0;
    this.p2Steps = 0;
    this.isEnded = false;
    this.isGreenLight = true;
    this.callbacks = config;

    containerEl.innerHTML = `
      <div style="text-align:center; margin-bottom:14px;">
        <div id="traffic-light" style="display:inline-block; padding:8px 24px; border-radius:30px; font-weight:bold; font-size:18px; background:#16a34a; color:#ffffff; transition:all 0.2s;">
          🟢 ไฟเขียว: วิ่งได้!
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:16px;">
        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#38bdf8; font-weight:bold;">Player 1: <span id="run-p1-val">0</span> / ${this.targetSteps} ก้าว</span>
            <span id="run-p1-penalty" style="color:#ef4444; font-size:12px; display:none;">⚠️ ฟาวล์! โดนถอยหลัง</span>
          </div>
          <div style="background:#334155; height:18px; border-radius:9px; overflow:hidden;">
            <div id="run-p1-bar" style="background:#38bdf8; height:100%; width:0%; transition:width 0.15s;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
            <span style="color:#f43f5e; font-weight:bold;">Player 2: <span id="run-p2-val">0</span> / ${this.targetSteps} ก้าว</span>
            <span id="run-p2-penalty" style="color:#ef4444; font-size:12px; display:none;">⚠️ ฟาวล์! โดนถอยหลัง</span>
          </div>
          <div style="background:#334155; height:18px; border-radius:9px; overflow:hidden;">
            <div id="run-p2-bar" style="background:#f43f5e; height:100%; width:0%; transition:width 0.15s;"></div>
          </div>
        </div>
      </div>
    `;

    this.startTrafficCycle();
  },

  startTrafficCycle() {
    const nextInterval = this.isGreenLight 
      ? Math.floor(Math.random() * 2000) + 2000  // เขียวนาน 2.0 - 4.0 วินาที
      : Math.floor(Math.random() * 1500) + 1500;  // แดงนาน 1.5 - 3.0 วินาที

    this.trafficTimer = setTimeout(() => {
      if (this.isEnded) return;
      this.isGreenLight = !this.isGreenLight;
      this.updateTrafficUI();
      this.startTrafficCycle();
    }, nextInterval);
  },

  updateTrafficUI() {
    const lightEl = document.getElementById("traffic-light");
    if (!lightEl) return;

    if (this.isGreenLight) {
      lightEl.textContent = "🟢 ไฟเขียว: วิ่งได้!";
      lightEl.style.background = "#16a34a";
    } else {
      lightEl.textContent = "🔴 ไฟแดง: หยุดดด!";
      lightEl.style.background = "#dc2626";
    }
  },

  handlePacket(role, data) {
    if (this.isEnded || data.type !== "STEP") return;

    if (this.isGreenLight) {
      // ไฟเขียว: เดินหน้าปกติ
      if (role === 1) {
        this.p1Steps = Math.min(this.targetSteps, this.p1Steps + 1);
        this.updateProgress(1, this.p1Steps);
        if (this.p1Steps >= this.targetSteps) this.finishGame(1);
      } else if (role === 2) {
        this.p2Steps = Math.min(this.targetSteps, this.p2Steps + 1);
        this.updateProgress(2, this.p2Steps);
        if (this.p2Steps >= this.targetSteps) this.finishGame(2);
      }
    } else {
      // ไฟแดง: ขยับแล้วโดนปรับถอยหลัง 2 ก้าว
      this.applyPenalty(role);
    }
  },

  applyPenalty(role) {
    const penaltySteps = 2;
    const prefix = role === 1 ? 'p1' : 'p2';
    const penaltyNotice = document.getElementById(`run-${prefix}-penalty`);

    if (role === 1) {
      this.p1Steps = Math.max(0, this.p1Steps - penaltySteps);
      this.updateProgress(1, this.p1Steps);
    } else {
      this.p2Steps = Math.max(0, this.p2Steps - penaltySteps);
      this.updateProgress(2, this.p2Steps);
    }

    if (penaltyNotice) {
      penaltyNotice.style.display = "inline";
      setTimeout(() => { penaltyNotice.style.display = "none"; }, 800);
    }
  },

  updateProgress(role, steps) {
    const pct = Math.min(100, Math.round((steps / this.targetSteps) * 100));
    const prefix = role === 1 ? 'p1' : 'p2';
    const valEl = document.getElementById(`run-${prefix}-val`);
    const barEl = document.getElementById(`run-${prefix}-bar`);
    if (valEl) valEl.textContent = steps;
    if (barEl) barEl.style.width = `${pct}%`;
  },

  finishGame(winnerRole) {
    this.isEnded = true;
    if (this.trafficTimer) clearTimeout(this.trafficTimer);
    if (this.callbacks && this.callbacks.onRoundFinish) {
      this.callbacks.onRoundFinish(winnerRole, {
        p1: winnerRole === 1 ? 10 : 0,
        p2: winnerRole === 2 ? 10 : 0
      });
    }
  },

  destroy() {
    this.isEnded = true;
    if (this.trafficTimer) clearTimeout(this.trafficTimer);
  }
};