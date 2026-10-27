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
      <div id="run-arena-wrap" style="display:flex; flex-direction:column; gap:14px;">
        <!-- Tactile Traffic Light Housing -->
        <div style="display:flex; flex-direction:column; align-items:center;">
          <div style="background:#18191c; border:3px solid #18191c; border-radius:40px; padding:6px 14px; display:inline-flex; align-items:center; gap:12px; box-shadow:0 4px 0 rgba(0,0,0,0.25);">
            <div id="light-lens-red" style="width:26px; height:26px; border-radius:50%; background:#451a1c; border:2px solid #000; transition:all 0.15s;"></div>
            <div id="light-lens-green" style="width:26px; height:26px; border-radius:50%; background:#1ed760; box-shadow:0 0 14px #1ed760; border:2px solid #000; transition:all 0.15s;"></div>
            <span id="traffic-label" style="font-weight:900; font-size:15px; color:#1ed760; letter-spacing:0.5px; min-width:115px; text-align:center;">
              RUN! วิ่งได้!
            </span>
          </div>
        </div>

        <!-- Race Track Lanes -->
        <div style="background:#242730; border:3px solid #18191c; border-radius:14px; padding:12px; display:flex; flex-direction:column; gap:14px; position:relative; overflow:hidden;">
          
          <!-- Finish Checkered Strip -->
          <div style="position:absolute; right:10px; top:0; bottom:0; width:12px; background:repeating-linear-gradient(0deg, #fff, #fff 6px, #18191c 6px, #18191c 12px); border-left:2px solid #18191c; border-right:2px solid #18191c; opacity:0.85;"></div>

          <!-- Lane 1: Player 1 -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding-right:26px;">
              <span style="color:#00b8e6; font-weight:800; font-size:13px;">P1 RUNNER</span>
              <span id="run-p1-penalty" style="background:#ff4554; color:#fff; font-size:10px; font-weight:800; padding:1px 6px; border-radius:4px; display:none;">⚠️ ฟาวล์ -2 ก้าว!</span>
              <span style="font-family:'JetBrains Mono', monospace; color:#fff; font-size:12px; font-weight:800;"><span id="run-p1-val">0</span>/${this.targetSteps}</span>
            </div>
            <div style="background:#16181d; height:34px; border-radius:10px; border:2px solid #000; position:relative; display:flex; align-items:center; padding:0 6px; margin-right:22px;">
              <div style="position:absolute; left:8px; right:8px; height:2px; border-top:2px dashed #3f4454;"></div>
              <div id="run-p1-bar" style="background:linear-gradient(90deg, rgba(0,184,230,0.25), rgba(0,184,230,0.7)); height:100%; width:0%; border-radius:8px; transition:width 0.15s;"></div>
              <div id="run-p1-avatar" style="position:absolute; left:0%; transform:translateX(-4px); width:28px; height:28px; background:#00b8e6; border:2.5px solid #18191c; border-radius:8px; display:grid; place-items:center; font-weight:900; font-size:11px; color:#fff; box-shadow:0 2px 0 #000; transition:left 0.15s;">P1</div>
            </div>
          </div>

          <!-- Lane 2: Player 2 -->
          <div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; padding-right:26px;">
              <span style="color:#ff4554; font-weight:800; font-size:13px;">P2 RUNNER</span>
              <span id="run-p2-penalty" style="background:#ff4554; color:#fff; font-size:10px; font-weight:800; padding:1px 6px; border-radius:4px; display:none;">⚠️ ฟาวล์ -2 ก้าว!</span>
              <span style="font-family:'JetBrains Mono', monospace; color:#fff; font-size:12px; font-weight:800;"><span id="run-p2-val">0</span>/${this.targetSteps}</span>
            </div>
            <div style="background:#16181d; height:34px; border-radius:10px; border:2px solid #000; position:relative; display:flex; align-items:center; padding:0 6px; margin-right:22px;">
              <div style="position:absolute; left:8px; right:8px; height:2px; border-top:2px dashed #3f4454;"></div>
              <div id="run-p2-bar" style="background:linear-gradient(90deg, rgba(255,69,84,0.25), rgba(255,69,84,0.7)); height:100%; width:0%; border-radius:8px; transition:width 0.15s;"></div>
              <div id="run-p2-avatar" style="position:absolute; left:0%; transform:translateX(-4px); width:28px; height:28px; background:#ff4554; border:2.5px solid #18191c; border-radius:8px; display:grid; place-items:center; font-weight:900; font-size:11px; color:#fff; box-shadow:0 2px 0 #000; transition:left 0.15s;">P2</div>
            </div>
          </div>
        </div>

        <div style="text-align:center; font-size:11px; color:#646875; font-weight:600;">
          👋 ปัดมือหน้าเซนเซอร์ตอน <b>ไฟเขียว</b> | ห้ามขยับตอน <b>ไฟแดง</b>!
        </div>
      </div>
    `;

    this.startTrafficCycle();
  },

  startTrafficCycle() {
    const nextInterval = this.isGreenLight 
      ? Math.floor(Math.random() * 2000) + 2000
      : Math.floor(Math.random() * 1500) + 1500;

    this.trafficTimer = setTimeout(() => {
      if (this.isEnded) return;
      this.isGreenLight = !this.isGreenLight;
      this.updateTrafficUI();
      this.startTrafficCycle();
    }, nextInterval);
  },

  updateTrafficUI() {
    const redLens = document.getElementById("light-lens-red");
    const greenLens = document.getElementById("light-lens-green");
    const label = document.getElementById("traffic-label");
    if (!label) return;

    if (this.isGreenLight) {
      redLens.style.background = "#451a1c";
      redLens.style.boxShadow = "none";
      greenLens.style.background = "#1ed760";
      greenLens.style.boxShadow = "0 0 14px #1ed760";
      label.textContent = "RUN! วิ่งได้!";
      label.style.color = "#1ed760";
    } else {
      greenLens.style.background = "#143821";
      greenLens.style.boxShadow = "none";
      redLens.style.background = "#ff4554";
      redLens.style.boxShadow = "0 0 14px #ff4554";
      label.textContent = "STOP! หยุด!";
      label.style.color = "#ff4554";
    }
  },

  handlePacket(role, data) {
    if (this.isEnded || data.type !== "STEP") return;

    if (this.isGreenLight) {
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
      this.applyPenalty(role);
    }
  },

  applyPenalty(role) {
    const penaltySteps = 2;
    const prefix = role === 1 ? 'p1' : 'p2';
    const penaltyNotice = document.getElementById(`run-${prefix}-penalty`);
    const wrap = document.getElementById("run-arena-wrap");

    if (role === 1) {
      this.p1Steps = Math.max(0, this.p1Steps - penaltySteps);
      this.updateProgress(1, this.p1Steps);
    } else {
      this.p2Steps = Math.max(0, this.p2Steps - penaltySteps);
      this.updateProgress(2, this.p2Steps);
    }

    if (wrap) {
      wrap.classList.remove("shake-anim");
      void wrap.offsetWidth;
      wrap.classList.add("shake-anim");
    }

    if (penaltyNotice) {
      penaltyNotice.style.display = "inline-block";
      setTimeout(() => { penaltyNotice.style.display = "none"; }, 850);
    }
  },

  updateProgress(role, steps) {
    const pct = Math.min(100, Math.round((steps / this.targetSteps) * 100));
    const prefix = role === 1 ? 'p1' : 'p2';
    const valEl = document.getElementById(`run-${prefix}-val`);
    const barEl = document.getElementById(`run-${prefix}-bar`);
    const avatarEl = document.getElementById(`run-${prefix}-avatar`);
    if (valEl) valEl.textContent = steps;
    if (barEl) barEl.style.width = `${pct}%`;
    if (avatarEl) avatarEl.style.left = `calc(${pct}% - 12px)`;
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
