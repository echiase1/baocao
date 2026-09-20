// server.js - Máy chủ trung tâm lưu trữ và đồng bộ mạng LAN
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, 'data.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
// Phục vụ trực tiếp file giao diện index.html cho mọi điện thoại trong mạng
app.use(express.static(__dirname));

// Khởi tạo file dữ liệu mặc định nếu chưa có
const INITIAL_DEPTS = ["Khoa Nội", "Khoa Ngoại", "Khoa Cấp cứu", "Khoa Sản", "Khoa Nhi", "Khoa TMH - RHM", "Phòng Khám"];
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify({ depts: INITIAL_DEPTS, records: {} }, null, 2));
}

function readData() {
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch (e) {
    return { depts: INITIAL_DEPTS, records: {} };
  }
}

function writeData(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// API: Lấy toàn bộ số liệu hiện có
app.get('/api/data', (req, res) => {
  res.json(readData());
});

// API: Cập nhật số liệu của 1 khoa phòng
app.post('/api/save-dept', (req, res) => {
  const { period, dept, recordData } = req.body;
  if (!period || !dept) return res.status(400).json({ error: "Thiếu thông tin!" });

  const current = readData();
  if (!current.records[period]) current.records[period] = {};
  current.records[period][dept] = recordData;

  writeData(current);
  res.json({ success: true, message: `Đã lưu số liệu ${dept} thành công!` });
});

// API: Thêm/Xóa khoa phòng
app.post('/api/update-depts', (req, res) => {
  const { depts } = req.body;
  if (!depts) return res.status(400).json({ error: "Dữ liệu lỗi" });

  const current = readData();
  current.depts = depts;
  writeData(current);
  res.json({ success: true });
});

// Lắng nghe trên mọi kết nối LAN (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`====================================================`);
  console.log(`🏥 MedStat Server LAN đang chạy!`);
  console.log(`Các máy khác trong cùng Wifi/LAN truy cập bằng:`);
  console.log(`👉 http://<IP-MÁY-TÍNH>:${PORT}`);
  console.log(`(Ví dụ: http://192.168.1.15:3000)`);
  console.log(`====================================================`);
});
