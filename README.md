# Physical Computing Project 2026 - IT KMITL HI

## PocketParty IoT
> **Portable Dual-Controller Physical Party Game on Mobile Web**  
> ชุดเกมพกพาสำหรับ 2 ผู้เล่น ควบคุมด้วยเซนเซอร์และเชื่อมต่อหน้าจอสมาร์ตโฟนผ่าน Wi-Fi

---

### สมาชิกในกลุ่ม (Team Members)

| รหัสนักศึกษา | ชื่อ - นามสกุล | หน้าที่ความรับผิดชอบ |
| :---: | :--- | :--- |
| 68070047 | นายต่อตระกูล ดวงแก้ว| Embedded Firmware, Hardware Circuit & MQTT Telemetry |
| 68070060 | นายธนวัฒน์ แท่งทอง | Mobile Web Game (Frontend), UI/UX|

---

### บทคัดย่อและที่มาของโครงงาน (Abstract & Motivation)
ปัจจุบันวิดีโอเกมสำหรับงานสังสรรค์ (Party Game) ที่ให้ความรู้สึกสัมผัสทางกายภาพ (Tactile Interaction) มักมีราคาสูงและต้องการอุปกรณ์ขนาดใหญ่ เช่น โทรทัศน์หรือคอนโซลเฉพาะกลุ่ม ขณะที่เกมบนสมาร์ตโฟนทั่วไปขาดมิติของการมีปฏิสัมพันธ์ทางกายภาพ 

**PocketParty IoT** ถูกออกแบบขึ้นเพื่อแก้ปัญหานี้ โดยเป็นชุดคอนโทรลเลอร์ขนาดกะทัดรัด 2 ชุด (Player 1 และ Player 2) ที่ใช้เพียงสัญญาณ Hotspot จากโทรศัพท์มือถือเครื่องเดียว ผู้เล่นสามารถเปิดเบราว์เซอร์สมาร์ตโฟนบน GitHub Pages เพื่อใช้เป็นหน้าจอกลาง และร่วมประชันกันผ่านมินิเกมที่ดึงเซนเซอร์เชิงกายภาพมาวัดทักษะปฏิกิริยาตอบสนองอย่างแท้จริง

---

### ระบบมินิเกมและการทำงานของเซนเซอร์ (Game Mechanics)

1. **Code Strike (Keypad):**
   * แข่งความไวและตรรกะ โดยหน้าจอบนมือถือจะสุ่มชุดรหัสตัวเลข ผู้เล่นต้องกดคีย์แพดให้ถูกต้องครบถ้วนก่อนอีกฝ่าย
2. **Space Hover & Balloon Pump (HC-SR04 Ultrasonic):**
   * แข่งขันการควบคุมระยะห่างของมือและการเคลื่อนไหวเชิงมิติ (Gesture Distance) เพื่อดันค่าพลังหรือสูบลมลูกโป่งบนหน้าจอ
3. **Overheat Panic (Temp Sensor):**
   * กติกาฉุกเฉินเมื่อระบบจำลองความร้อน ผู้เล่นต้องระบายความร้อนหรือสัมผัสเพื่อปรับค่าอุณหภูมิให้ตรงตามเป้าหมาย
4. **Status & Feedback (7-Segment):**
   * 7-Segment แสดงค่าคะแนนสะสมและเวลานับถอยหลัง

---

### สถาปัตยกรรมระบบ (System Architecture)

```text
[ Controller 1: UNO R4 ] ──(Wi-Fi / MQTT)──┐
  (Keypad, Ultrasonic)               ├──► [ Public MQTT Broker ] ──► [ Smartphone Web Browser ]
                                           │       (WebSocket / WSS)          (GitHub Pages Host)
[ Controller 2: UNO R4 ] ──(Wi-Fi / MQTT)──┘
  (Keypad, Ultrasonic)
```
###Poster
