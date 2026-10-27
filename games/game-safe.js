/**
 * Game 3: Safe Cracker (ปลดรหัสเซฟ 3 ชั้น)
 * กติกา: หมุน Potentiometer ทีละ Step 5 แล้วกด '#' ปลดล็อคให้ครบ 3 ชั้น
 */
const GameSafe = {
  id: "SAFE_CRACKER",
  title: "🔐 ถอดรหัสตู้เซฟ 3 ชั้น (Step 5)",
  arduinoMode: "SAFE",

  // รหัส 3 สเต็ป (ลงท้ายด้วยเลข 0 หรือ 5 เสมอ)
  targets: [0, 0, 0],
  p1Stage: 0,
  p2Stage: 0,
  p1CurrentVal: 0,
  p2CurrentVal: 0,
  isEnded: false,
  callbacks: null,

  // ฟังก์ชันแปลงค่าให้ปัดเป็นทีละ 5 (0, 5, 10, ..., 100)
  snapTo5(val) {
    return Math.round(val / 5) * 5;
  },

  // สุ่มเลข step 5 ช่วง 10 - 90
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
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:16px;">
        <!-- Player 1 -->
        <div style="background:#0b0f19; padding:12px; border-radius:8px; border:1px solid #38bdf8;">
          <h4 style="color:#38bdf8; margin:0 0 6px 0;">P1 Safe (<span id="safe-p1-stage">1</span>/3)</h4>
          <div id="safe-p1-hint" style="font-size:13px; color:#facc15; min-height:36px;">
            เป้าหมาย: <b>${this.targets[0]}</b>
          </div>
          <div style="font-size:14px; margin:6px 0;">ค่าปัจจุบัน: <b id="safe-p1-val">0</b></div>
          <div style="height:12px; background:#334155; border-radius:6px; margin:8px 0; overflow:hidden;">
            <div id="safe-p1-bar" style="height:100%; width:0%; background:#38bdf8; transition:width 0.1s;"></div>
          </div>
          <div id="safe-p1-status" style="font-size:12px; color:#94a3b8;">หมุนให้ตรงแล้วกด #</div>
        </div>

        <!-- Player 2 -->
        <div style="background:#0b0f19; padding:12px; border-radius:8px; border:1px solid #f43f5e;">
          <h4 style="color:#f43f5e; margin:0 0 6px 0;">P2 Safe (<span id="safe-p2-stage">1</span>/3)</h4>
          <div id="safe-p2-hint" style="font-size:13px; color:#facc15; min-height:36px;">
            เป้าหมาย: <b>${this.targets[0]}</b>
          </div>
          <div style="font-size:14px; margin:6px 0;">ค่าปัจจุบัน: <b id="safe-p2-val">0</b></div>
          <div style="height:12px; background:#334155; border-radius:6px; margin:8px 0; overflow:hidden;">
            <div id="safe-p2-bar" style="height:100%; width:0%; background:#f43f5e; transition:width 0.1s;"></div>
          </div>
          <div id="safe-p2-status" style="font-size:12px; color:#94a3b8;">หมุนให้ตรงแล้วกด #</div>
        </div>
      </div>
      <div style="text-align:center; margin-top:12px; font-size:12px; color:#64748b;">
        ระบบปรับค่าทีละ 5 | ชั้น 2 และ 3 จะแสดงเฉพาะ "ระยะห่างจากรหัส"
      </div>
    `;
  },

  handlePacket(role, data) {
    if (this.isEnded) return;

    // รับค่า Potentiometer พร้อม Snap เป็น Step 5
    if (data.type === "POT") {
      const snappedVal = this.snapTo5(data.val);
      if (role === 1) this.p1CurrentVal = snappedVal;
      else this.p2CurrentVal = snappedVal;

      this.updatePlayerUI(role);
    }

    // กดปุ่ม '#' ยืนยันปลดล็อคชั้นปัจจุบัน
    else if (data.type === "KEY" && data.key === "#") {
      const stage = role === 1 ? this.p1Stage : this.p2Stage;
      const currentVal = role === 1 ? this.p1CurrentVal : this.p2CurrentVal;
      const targetVal = this.targets[stage];

      if (currentVal === targetVal) {
        if (role === 1) this.p1Stage++;
        else this.p2Stage++;

        const newStage = role === 1 ? this.p1Stage : this.p2Stage;

        // เช็คว่าปลดครบ 3 ชั้นหรือยัง
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
    const hintEl = document.getElementById(`safe-${prefix}-hint`);
    const statusEl = document.getElementById(`safe-${prefix}-status`);

    if (stageEl) stageEl.textContent = stage + 1;
    if (valEl) valEl.textContent = currentVal;
    if (barEl) barEl.style.width = `${currentVal}%`;

    // อัปเดตคำใบ้ตามด่าน
    if (hintEl) {
      if (stage === 0) {
        // ล็อคแรก: บอกเลขตรงๆ
        hintEl.innerHTML = `เป้าหมาย: <b style="font-size:18px;">${targetVal}</b>`;
      } else {
        // ล็อค 2 และ 3: บอกเฉพาะระยะห่าง ไม่บอกทิศทาง
        const diff = Math.abs(currentVal - targetVal);
        hintEl.innerHTML = `คำใบ้: <b>ห่างจากรหัสอยู่ ${diff}</b>`;
      }
    }

    // แสดงสถานะเมื่อเลขตรงเป๊ะ
    if (statusEl) {
      if (currentVal === targetVal) {
        statusEl.textContent = "🟢 ตรงเป๊ะแล้ว! กดปุ่ม # เพื่อปลดล็อค!";
        statusEl.style.color = "#4ade80";
      } else {
        statusEl.textContent = "หมุนหาค่าที่ถูกต้องแล้วกด #";
        statusEl.style.color = "#94a3b8";
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