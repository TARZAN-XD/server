import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT || 3000;

// للحصول على مسار __dirname في ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_GATEWAY_API_KEY = "MXugLSTxZDakBn9wPpzrv1tv";

app.use(cors());
app.use(express.json());

// استضافة ملفات ثابتة (الواجهة)
app.use(express.static(path.join(__dirname, 'public')));

// مسار صفحة البداية
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// مسار API للدردشة
app.post('/chat', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    const response = await fetch('https://api.ai-gateway.com/v1/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${AI_GATEWAY_API_KEY}`
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    res.json({ reply: data.reply || 'لا يوجد رد من الخدمة' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
