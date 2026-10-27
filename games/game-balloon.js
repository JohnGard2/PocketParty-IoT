/**
 * Game 2: Balloon Pump (จดจำขนาด + ระบบรีเซ็ตลมและระเบิด)
 * กติกา:
 * 1. จดจำขนาดตัวอย่างตอนเริ่มเกม
 * 2. ปั๊มลูกโป่งให้ใกล้เคียงตัวอย่างที่สุด (ไม่มีตัวเลข % แสดง)
 * 3. มีปุ่มปล่อยลม (Reset) เพื่อเริ่มเป่าใหม่ได้หากเป่าเกิน
 * 4. หากเป่าจนใหญ่เกินขนาดที่กำหนด (Over-inflate) ลูกโป่งจะแตกทันที (ถ้า P2 ทำแตก P1 ชนะทันที)
 */
const GameBalloon = {
  id: "BALLOON_PUMP",
  title: "🎈 เป่าลูกโป่งให้เท่าตัวอย่าง",
  arduinoMode: "BALLOON",

  targetAir: 0,
  maxAir: 115, // ขีดจำกัดสูงสุด หากเกินนี้ลูกโป่งจะแตก
  p1Air: 0,
  p2Air: 0,
  p1Locked: false,
  p2Locked: false,
  isEnded: false,
  callbacks: null,
  previewTimer: null,

  init(containerEl, config) {
    this.targetAir = Math.floor(Math.random() * 45) + 40; // สุ่มขนาดเป้าหมาย 40 - 85
    this.p1Air = 0;
    this.p2Air = 0;
    this.p1Locked = false;
    this.p2Locked = false;
    this.isEnded = false;
    this.callbacks = config;

    const targetSize = 50 + (this.targetAir * 1.0);

    containerEl.innerHTML = `
      <div style="text-align:center; margin-bottom:12px;">
        <div id="target-wrapper">
          <div style="font-size:13px; color:#facc15; font-weight:bold;">🎯 จดจำขนาดลูกโป่งตัวอย่างนี้! (<span id="target-countdown">3</span>s)</div>
          <div id="balloon-target" style="margin:10px auto; width:${targetSize}px; height:${targetSize}px; background:#e2e8f0; border-radius:50%; border:2px dashed #94a3b8; transition:all 0.2s;"></div>
        </div>
        <div id="target-hidden-msg" style="display:none; font-size:13px; color:#94a3b8;">
          ตัวอย่างถูกซ่อนแล้ว! ปั๊มให้ใกล้เคียงที่สุด (ระวังอย่าให้ลูกโป่งแตก)
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px; text-align:center;">
        <!-- P1 Balloon -->
        <div style="background:#0b0f19; padding:12px; border-radius:8px; border:1px solid #38bdf8;">
          <h4 style="color:#38bdf8; margin:0 0 8px 0;">P1 BALLOON</h4>
          <div style="height:170px; display:flex; align-items:center; justify-content:center;">
            <div id="balloon-p1" style="width:50px; height:50px; background:#38bdf8; border-radius:50%; transition:all 0.1s;"></div>
          </div>
          <div id="p1-status" style="font-size:12px; color:#94a3b8; margin-bottom:8px;">กำลังเป่า...</div>
          <div style="display:flex; justify-content:center; gap:6px;">
            <button id="btn-p1-reset" style="background:#475569; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">💨 ปล่อยลม (Reset)</button>
            <button id="btn-p1-lock" style="background:#0284c7; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">🔒 ล็อคขนาด</button>
          </div>
        </div>

        <!-- P2 Balloon -->
        <div style="background:#0b0f19; padding:12px; border-radius:8px; border:1px solid #f43f5e;">
          <h4 style="color:#f43f5e; margin:0 0 8px 0;">P2 BALLOON</h4>
          <div style="height:170px; display:flex; align-items:center; justify-content:center;">
            <div id="balloon-p2" style="width:50px; height:50px; background:#f43f5e; border-radius:50%; transition:all 0.1s;"></div>
          </div>
          <div id="p2-status" style="font-size:12px; color:#94a3b8; margin-bottom:8px;">กำลังเป่า...</div>
          <div style="display:flex; justify-content:center; gap:6px;">
            <button id="btn-p2-reset" style="background:#475569; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">💨 ปล่อยลม (Reset)</button>
            <button id="btn-p2-lock" style="background:#e11d48; color:#fff; border:none; padding:4px 8px; border-radius:4px; cursor:pointer; font-size:11px;">🔒 ล็อคขนาด</button>
          </div>
        </div>
      </div>

      <div style="text-align:center; margin-top:10px; font-size:12px; color:#64748b;">
        Keypad: กด <b>*</b> เพื่อปล่อยลมรีเซ็ต | กด <b>#</b> เพื่อล็อคขนาด
      </div>
    `;

    // ผูก Event ปุ่มกดบนหน้าจอ
    document.getElementById("btn-p1-reset")?.addEventListener("click", () => this.resetBalloon(1));
    document.getElementById("btn-p2-reset")?.addEventListener("click", () => this.resetBalloon(2));
    document.getElementById("btn-p1-lock")?.addEventListener("click", () => this.lockBalloon(1));
    document.getElementById("btn-p2-lock")?.addEventListener("click", () => this.lockBalloon(2));

    // นับถอยหลังซ่อนตัวอย่างเป้าหมาย
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

    // 1. รับสัญญาณปั๊มลม
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

    // 2. รับสัญญาณปล่อยลม / รีเซ็ต (ผ่าน Packet RESET/DEFLATE หรือปุ่ม '*')
    else if (data.type === "RESET" || data.type === "DEFLATE" || (data.type === "KEY" && data.key === "*")) {
      this.resetBalloon(role);
    }

    // 3. รับสัญญาณล็อคขนาด (ผ่าน Packet CONFIRM หรือปุ่ม '#')
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
        status.textContent = "กำลังเป่า...";
        status.style.color = "#94a3b8";
      }
      this.renderBalloon(1, 0);
    } else if (role === 2) {
      this.p2Air = 0;
      this.p2Locked = false;
      const status = document.getElementById("p2-status");
      if (status) {
        status.textContent = "กำลังเป่า...";
        status.style.color = "#94a3b8";
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
        status.textContent = "🔒 ล็อคขนาดแล้ว";
        status.style.color = "#38bdf8";
      }
    } else if (role === 2) {
      this.p2Locked = true;
      const status = document.getElementById("p2-status");
      if (status) {
        status.textContent = "🔒 ล็อคขนาดแล้ว";
        status.style.color = "#f43f5e";
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

    // ตรวจสอบเงื่อนไขลูกโป่งแตก (Over-inflate)
    if (air > this.maxAir) {
      el.style.background = "transparent";
      el.style.border = "3px dashed #ef4444";
      el.style.width = "70px";
      el.style.height = "70px";

      if (status) {
        status.textContent = "💥 ลูกโป่งแตก!";
        status.style.color = "#ef4444";
      }

      // หาก P2 ทำแตก -> P1 การันตีชนะทันที (และหาก P1 ทำแตกเอง -> P2 ชนะ)
      if (role === 2) {
        this.finishGame(1);
      } else {
        this.finishGame(2);
      }
      return;
    }

    // ขยายขนาดตามลมที่เป่าเข้าไป
    const size = 50 + (air * 1.0);
    el.style.width = `${size}px`;
    el.style.height = `${size}px`;
    el.style.border = "none";
    el.style.background = role === 1 ? "#38bdf8" : "#f43f5e";
  },

  evaluateWinner() {
    const p1Diff = Math.abs(this.p1Air - this.targetAir);
    const p2Diff = Math.abs(this.p2Air - this.targetAir);

    // แสดงเฉลยขนาด
    const hiddenMsg = document.getElementById("target-hidden-msg");
    if (hiddenMsg) {
      hiddenMsg.innerHTML = `<b style="color:#facc15;">เฉลยขนาดเป้าหมาย!</b>`;
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