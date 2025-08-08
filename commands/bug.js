module.exports = {
  name: "bug",
  description: "أمر لإرسال رسالة نصية ثقيلة جدًا لاختبار الجهاز",
  execute: async (sock, from) => {
    try {
      let heavyText = '🛠️ اختبار bug قوي جدًا\n\n';
      heavyText += 'ꦾ'.repeat(100000); // نص ضخم جداً

      await sock.sendMessage(from, { text: heavyText });
      console.log(`تم إرسال أمر bug إلى ${from}`);
    } catch (error) {
      console.error('خطأ في أمر bug:', error);
    }
  }
};
