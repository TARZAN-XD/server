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

    console.log('Response from AI API:', data);  // **اضف هذا السطر**

    // مثال تعديل استخراج الرد (حسب هيكل البيانات الحقيقية)
    // فرضًا الرد في data.reply
    // إذا لم يكن موجود، جرب تعدل هنا حسب ما تجد في الـ console.log

    res.json({ reply: data.reply || 'لا يوجد رد من الخدمة' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
  }
});
