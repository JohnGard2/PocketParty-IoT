/**
 * Game 3: Safe Cracker (ปลดรหัสเซฟ 3 ชั้น)
 * กติกา: หมุน Potentiometer ทีละ Step 5 แล้วกด '#' ปลดล็อคให้ครบ 3 ชั้น
 */
const GameSafe = {
  id: "SAFE_CRACKER",
  title: "🔐 ถอดรหัสตู้เซฟ 3 ชั้น",
  arduinoMode: "SAFE",

  targets: [0, 0, 0],
  p1Stage: 0,
  p2Stage: 0,
  p1CurrentVal: 0,
  p2CurrentVal: 0,
  isEnded: false,
  callbacks: null,

  snapTo5(val) {
    return Math.round(val / 5) * 5;
  },

  randomStep5() {
    return (Math.floor(Math.random() * 17) + 2) * 5;
  },

  init(containerEl, config) {
    this.targets = [this.randomStep5(), this.randomStep5(), this.randomStep5()];
    this.p1Stage = 0;
    this.p2Stage = 0;
    this.p1CurrentVal = 0;
    this.p2CurrentVal = 0;
    this.isEnded = false;
    this.callbacks = config;

    containerEl.innerHTML = `
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        <!-- P1 Safe Dial Vault -->
        <div style="background:#f8fafc; padding:10px; border-radius:14px; border:3px solid #18191c; box-shadow:0 3px 0 #18191c; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:900; font-size:12px; color:#008eb3;">P1 VAULT</span>
            <span style="font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:800; background:#e0f8fe; padding:1px 6px; border-radius:4px; border:1.5px solid #18191c;">ชั้น <span id="safe-p1-stage">1</span>/3</span>
          </div>

          <!-- Rotary Knob Visual -->
          <div style="position:relative; width:96px; height:96px; margin:8px auto; border-radius:50%; background:#18191c; border:3px solid #00b8e6; display:grid; place-items:center; box-shadow:0 4px 0 rgba(0,0,0,0.25);">
            <div id="safe-p1-dial" style="position:absolute; inset:6px; border-radius:50%; border:2px dashed #64748b; transition:transform 0.15s ease;">
              <div style="width:6px; height:12px; background:#00b8e6; margin:0 auto; border-radius:3px;"></div>
            </div>
            <div style="font-family:'JetBrains Mono', monospace; font-size:22px; font-weight:800; color:#fff; z-index:2;" id="safe-p1-val">0</div>
          </div>

          <div id="safe-p1-hint" style="background:#fffbeb; border:2px solid #18191c; border-radius:8px; padding:4px; font-size:12px; font-weight:700; color:#b45309; min-height:32px; display:grid; place-items:center; margin-bottom:6px;">
            รหัสชั้นแรก: <b>${this.targets[0]}</b>
          </div>

          <div style="height:8px; background:#e2e8f0; border-radius:4px; border:1.5px solid #18191c; overflow:hidden; margin-bottom:6px;">
            <div id="safe-p1-bar" style="height:100%; width:0%; background:#00b8e6; transition:width 0.1s;"></div>
          </div>
          <div id="safe-p1-status" style="font-size:11px; font-weight:700; color:#646875;">หมุนให้ตรงแล้วกด #</div>
        </div>

        <!-- P2 Safe Dial Vault -->
        <div style="background:#f8fafc; padding:10px; border-radius:14px; border:3px solid #18191c; box-shadow:0 3px 0 #18191c; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-weight:900; font-size:12px; color:#cc2936;">P2 VAULT</span>
            <span style="font-family:'JetBrains Mono', monospace; font-size:11px; font-weight:800; background:#ffe8ea; padding:1px 6px; border-radius:4px; border:1.5px solid #18191c;">ชั้น <span id="safe-p2-stage">1</span>/3</span>
          </div>

          <!-- Rotary Knob Visual -->
          <div style="position:relative; width:96px; height:96px; margin:8px auto; border-radius:50%; background:#18191c; border:3px solid #ff4554; display:grid; place-items:center; box-shadow:0 4px 0 rgba(0,0,0,0.25);">
            <div id="safe-p2-dial" style="position:absolute; inset:6px; border-radius:50%; border:2px dashed #64748b; transition:transform 0.15s ease;">
              <div style="width:6px; height:12px; background:#ff4554; margin:0 auto; border-radius:3px;"></div>
            </div>
            <div style="font-family:'JetBrains Mono', monospace; font-size:22px; font-weight:800; color:#fff; z-index:2;" id="safe-p2-val">0</div>
          </div>

          <div id="safe-p2-hint" style="background:#fffbeb; border:2px solid #18191c; border-radius:8px; padding:4px; font-size:12px; font-weight:700; color:#b45309; min-height:32px; display:grid; place-items:center; margin-bottom:6px;">
            รหัสชั้นแรก: <b>${this.targets[0]}</b>
          </div>

          <div style="height:8px; background:#e2e8f0; border-radius:4px; border:1.5px solid #18191c; overflow:hidden; margin-bottom:6px;">
            <div id="safe-p2-bar" style="height:100%; width:0%; background:#ff4554; transition:width 0.1s;"></div>
          </div>
          <div id="safe-p2-status" style="font-size:11px; font-weight:700; color:#646875;">หมุนให้ตรงแล้วกด #</div>
        </div>
      </div>

      <div style="text-align:center; margin-top:10px; font-size:11px; color:#646875; font-weight:600;">
        🎛️ หมุนทีละ Step 5 | ชั้น 2-3 จะใบ้เฉพาะ <b>"ระยะห่าง"</b> แล้วกด <b>#</b>
      </div>
    `;
  },

  handlePacket(role, data) {
    if (this.isEnded) return;

    if (data.type === "POT") {
      const snappedVal = this.snapTo5(data.val);
      if (role === 1) this.p1CurrentVal = snappedVal;
      else this.p2CurrentVal = snappedVal;

      this.updatePlayerUI(role);
    }
    else if (data.type === "KEY" && data.key === "#") {
      const stage = role === 1 ? this.p1Stage : this.p2Stage;
      const currentVal = role === 1 ? this.p1CurrentVal : this.p2CurrentVal;
      const targetVal = this.targets[stage];

      if (currentVal === targetVal) {
        if (role === 1) this.p1Stage++;
        else this.p2Stage++;

        const newStage = role === 1 ? this.p1Stage : this.p2Stage;
        if (newStage >= 3) {
          this.finishGame(role);
        } else {
          this.updatePlayerUI(role);
        }
      }
    }
  },

  updatePlayerUI(role) {
    const prefix = role === 1 ? 'p1' : 'p2';
    const stage = role === 1 ? this.p1Stage : this.p2Stage;
    const currentVal = role === 1 ? this.p1CurrentVal : this.p2CurrentVal;
    const targetVal = this.targets[stage];

    const stageEl = document.getElementById(`safe-${prefix}-stage`);
    const valEl = document.getElementById(`safe-${prefix}-val`);
    const barEl = document.getElementById(`safe-${prefix}-bar`);
    const dialEl = document.getElementById(`safe-${prefix}-dial`);
    const hintEl = document.getElementById(`safe-${prefix}-hint`);
    const statusEl = document.getElementById(`safe-${prefix}-status`);

    if (stageEl) stageEl.textContent = stage + 1;
    if (valEl) valEl.textContent = currentVal;
    if (barEl) barEl.style.width = `${currentVal}%`;
    if (dialEl) dialEl.style.transform = `rotate(${(currentVal / 100) * 300 - 150}deg)`;

    if (hintEl) {
      if (stage === 0) {
        hintEl.innerHTML = `รหัสชั้นแรก: <b>${targetVal}</b>`;
      } else {
        const diff = Math.abs(currentVal - targetVal);
        hintEl.innerHTML = `📡 ห่างจากรหัสอยู่ <b>${diff}</b>`;
      }
    }

    if (statusEl) {
      if (currentVal === targetVal) {
        statusEl.textContent = "🟢 ตรงเป๊ะ! กด # ปลดล็อค!";
        statusEl.style.color = "#149e44";
      } else {
        statusEl.textContent = "หมุนหาค่าแล้วกด #";
        statusEl.style.color = "#646875";
      }
    }
  },

  finishGame(winnerRole) {
    this.isEnded = true;
    if (this.callbacks && this.callbacks.onRoundFinish) {
      this.callbacks.onRoundFinish(winnerRole, {
        p1: winnerRole === 1 ? 10 : 0,
        p2: winnerRole === 2 ? 10 : 0
      });
    }
  },

  destroy() {
    this.isEnded = true;
  }
};
