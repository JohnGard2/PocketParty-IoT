/**
 * Game 2: Balloon Pump (จดจำขนาด + ระบบรีเซ็ตลมและระเบิด)
 */
const GameBalloon = {
  id: "BALLOON_PUMP",
  title: "🎈 ปั๊มลูกโป่งให้เท่าตัวอย่าง",
  arduinoMode: "BALLOON",

  targetAir: 0,
  maxAir: 115,
  p1Air: 0,
  p2Air: 0,
  p1Locked: false,
  p2Locked: false,
  isEnded: false,
  callbacks: null,
  previewTimer: null,

  init(containerEl, config) {
    this.targetAir = Math.floor(Math.random() * 45) + 40;
    this.p1Air = 0;
    this.p2Air = 0;
    this.p1Locked = false;
    this.p2Locked = false;
    this.isEnded = false;
    this.callbacks = config;

    const targetSize = 46 + (this.targetAir * 0.9);

    containerEl.innerHTML = `
      <div style="text-align:center; margin-bottom:10px;">
        <div id="target-wrapper" style="background:#fffbeb; border:2.5px solid #18191c; border-radius:12px; padding:8px; box-shadow:0 3px 0 #18191c;">
          <div style="font-size:12px; color:#b45309; font-weight:800;">
            ⏱️ จดจำขนาดตัวอย่างใน <span id="target-countdown" style="background:#18191c; color:#ffd000; padding:1px 6px; border-radius:4px;">3</span> วินาที!
          </div>
          <div style="height:125px; display:flex; align-items:center; justify-content:center;">
            <div id="balloon-target" style="width:${targetSize}px; height:${targetSize}px; background:radial-gradient(circle at 32% 30%, #fff, #ffd000 55%, #d97706); border-radius:50% 50% 48% 48%; border:3px solid #18191c; box-shadow:0 4px 0 rgba(0,0,0,0.2);"></div>
          </div>
        </div>
        <div id="target-hidden-msg" style="display:none; background:#18191c; color:#ffd000; padding:6px 10px; border-radius:8px; font-size:12px; font-weight:700;">
          🙈 ซ่อนตัวอย่างแล้ว! ปั๊มให้ใกล้เคียงที่สุด (เกินขีดจำกัด = แตก 💥)
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; text-align:center;">
        <!-- P1 Balloon Chamber -->
        <div style="background:#f8fafc; padding:10px 8px; border-radius:14px; border:3px solid #18191c; box-shadow:0 3px 0 #18191c; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="font-size:12px; font-weight:900; color:#008eb3;">P1 CHAMBER</div>
          <div style="height:145px; display:flex; align-items:center; justify-content:center; position:relative;">
            <div id="balloon-p1" style="width:46px; height:46px; background:radial-gradient(circle at 30% 30%, #a5f3fc, #00b8e6 60%, #0284c7); border-radius:50%; border:2.5px solid #18191c; transition:all 0.12s;"></div>
          </div>
          <div id="p1-status" style="font-size:11px; font-weight:700; color:#646875; margin-bottom:6px;">กำลังปั๊มลม...</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
            <button id="btn-p1-reset" class="btn-tactile" style="padding:5px; font-size:10px;">💨 รีเซ็ต (*)</button>
            <button id="btn-p1-lock" class="btn-tactile btn-blue" style="padding:5px; font-size:10px;">🔒 ล็อค (#)</button>
          </div>
        </div>

        <!-- P2 Balloon Chamber -->
        <div style="background:#f8fafc; padding:10px 8px; border-radius:14px; border:3px solid #18191c; box-shadow:0 3px 0 #18191c; display:flex; flex-direction:column; justify-content:space-between;">
          <div style="font-size:12px; font-weight:900; color:#cc2936;">P2 CHAMBER</div>
          <div style="height:145px; display:flex; align-items:center; justify-content:center; position:relative;">
            <div id="balloon-p2" style="width:46px; height:46px; background:radial-gradient(circle at 30% 30%, #fecdd3, #ff4554 60%, #e11d48); border-radius:50%; border:2.5px solid #18191c; transition:all 0.12s;"></div>
          </div>
          <div id="p2-status" style="font-size:11px; font-weight:700; color:#646875; margin-bottom:6px;">กำลังปั๊มลม...</div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
            <button id="btn-p2-reset" class="btn-tactile" style="padding:5px; font-size:10px;">💨 รีเซ็ต (*)</button>
            <button id="btn-p2-lock" class="btn-tactile btn-red" style="padding:5px; font-size:10px;">🔒 ล็อค (#)</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById("btn-p1-reset")?.addEventListener("click", () => this.resetBalloon(1));
    document.getElementById("btn-p2-reset")?.addEventListener("click", () => this.resetBalloon(2));
    document.getElementById("btn-p1-lock")?.addEventListener("click", () => this.lockBalloon(1));
    document.getElementById("btn-p2-lock")?.addEventListener("click", () => this.lockBalloon(2));

    let timeLeft = 3;
    this.previewTimer = setInterval(() => {
      timeLeft--;
      const countEl = document.getElementById("target-countdown");
      if (countEl) countEl.textContent = timeLeft;

      if (timeLeft <= 0) {
        clearInterval(this.previewTimer);
        const targetEl = document.getElementById("target-wrapper");
        const hiddenMsg = document.getElementById("target-hidden-msg");
        if (targetEl) targetEl.style.display = "none";
        if (hiddenMsg) hiddenMsg.style.display = "block";
      }
    }, 1000);
  },

  handlePacket(role, data) {
    if (this.isEnded) return;

    if (data.type === "PUMP") {
      const addedAir = Math.max(1, Math.round(data.depth * 0.25));
      if (role === 1 && !this.p1Locked) {
        this.p1Air += addedAir;
        this.renderBalloon(1, this.p1Air);
      } else if (role === 2 && !this.p2Locked) {
        this.p2Air += addedAir;
        this.renderBalloon(2, this.p2Air);
      }
    }
    else if (data.type === "RESET" || data.type === "DEFLATE" || (data.type === "KEY" && data.key === "*")) {
      this.resetBalloon(role);
    }
    else if (data.type === "CONFIRM" || (data.type === "KEY" && data.key === "#")) {
      this.lockBalloon(role);
    }
  },

  resetBalloon(role) {
    if (this.isEnded) return;

    if (role === 1) {
      this.p1Air = 0;
      this.p1Locked = false;
      const status = document.getElementById("p1-status");
      if (status) {
        status.textContent = "ปล่อยลมแล้ว เริ่มใหม่!";
        status.style.color = "#646875";
      }
      this.renderBalloon(1, 0);
    } else if (role === 2) {
      this.p2Air = 0;
      this.p2Locked = false;
      const status = document.getElementById("p2-status");
      if (status) {
        status.textContent = "ปล่อยลมแล้ว เริ่มใหม่!";
        status.style.color = "#646875";
      }
      this.renderBalloon(2, 0);
    }
  },

  lockBalloon(role) {
    if (this.isEnded) return;

    if (role === 1) {
      this.p1Locked = true;
      const status = document.getElementById("p1-status");
      if (status) {
        status.textContent = "🔒 ล็อคขนาดแล้ว!";
        status.style.color = "#008eb3";
      }
    } else if (role === 2) {
      this.p2Locked = true;
      const status = document.getElementById("p2-status");
      if (status) {
        status.textContent = "🔒 ล็อคขนาดแล้ว!";
        status.style.color = "#cc2936";
      }
    }

    if (this.p1Locked && this.p2Locked) {
      this.evaluateWinner();
    }
  },

  renderBalloon(role, air) {
    const prefix = role === 1 ? 'p1' : 'p2';
    const el = document.getElementById(`balloon-${prefix}`);
    const status = document.getElementById(`p${role}-status`);
    if (!el) return;

    if (air > this.maxAir) {
      el.style.background = "transparent";
      el.style.border = "3px dashed #ff4554";
      el.style.width = "80px";
      el.style.height = "80px";

      if (status) {
        status.textContent = "💥 ลูกโป่งแตก!";
        status.style.color = "#ff4554";
      }

      if (role === 2) {
        this.finishGame(1);
      } else {
        this.finishGame(2);
      }
      return;
    }

    const size = 46 + (air * 0.9);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.border = "2.5px solid #18191c";
    el.style.background = role === 1
      ? "radial-gradient(circle at 30% 30%, #a5f3fc, #00b8e6 60%, #0284c7)"
      : "radial-gradient(circle at 30% 30%, #fecdd3, #ff4554 60%, #e11d48)";
  },

  evaluateWinner() {
    const p1Diff = Math.abs(this.p1Air - this.targetAir);
    const p2Diff = Math.abs(this.p2Air - this.targetAir);

    const hiddenMsg = document.getElementById("target-hidden-msg");
    if (hiddenMsg) {
      hiddenMsg.innerHTML = `🎯 เฉลย! P1 คลาดเคลื่อน ${p1Diff} | P2 คลาดเคลื่อน ${p2Diff}`;
    }
    const targetEl = document.getElementById("target-wrapper");
    if (targetEl) targetEl.style.display = "block";

    if (p1Diff < p2Diff) {
      this.finishGame(1);
    } else if (p2Diff < p1Diff) {
      this.finishGame(2);
    } else {
      this.finishGame(0);
    }
  },

  finishGame(winnerRole) {
    if (this.isEnded) return;
    this.isEnded = true;
    if (this.previewTimer) clearInterval(this.previewTimer);

    if (this.callbacks && this.callbacks.onRoundFinish) {
      this.callbacks.onRoundFinish(winnerRole, {
        p1: winnerRole === 1 ? 10 : 0,
        p2: winnerRole === 2 ? 10 : 0
      });
    }
  },

  destroy() {
    this.isEnded = true;
    if (this.previewTimer) clearInterval(this.previewTimer);
  }
};
