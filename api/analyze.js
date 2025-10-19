// ملف: api/analyze.js (يتم نشره على Vercel/Netlify)

import { GoogleGenAI } from '@google/genai';

// المفتاح السري يُقرأ بأمان من متغيرات البيئة
// **لا تضع المفتاح السري هنا**
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY, // هذا المتغير سيُخزن فيه مفتاحك الجديد
});

// هذا هو المنطق الذي يشغل الـ AI
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { analysis_text } = req.body;

  if (!analysis_text || analysis_text.length < 50) {
    return res.status(400).json({ error: 'الرجاء إرسال نص كافٍ للتحليل.' });
  }

  // التعليمات الموجهة لنموذج Gemini (System Instruction)
  const prompt = `أنت خبير في الفلسفة والمنطق. مهمتك هي تحليل النص العربي المُقدم وتحديد المغالطات المنطقية الرئيسية (مثل رجل القش، الهجوم الشخصي، التعميم المتسرع، التوسل بالسلطة) وتقييم جودة الاستدلال. قم بتوليد إجابة في صيغة JSON فقط تحتوي على: 
  1. rationality_index: (عدد صحيح من 0 إلى 100 يمثل مقياس العقلانية). 
  2. detected_fallacies: (مصفوفة من أسماء المغالطات المكتشفة).
  3. initial_comment: (تعليق أولي مقتضب للمستخدم لا يكشف كل شيء، ولا يتجاوز 20 كلمة).
  4. full_analysis: (تحليل مفصل وموسع، هذا المحتوى سيكون سريًا وخاصًا بأعضاء التيليجرام).
  
  النص لتحليله: "${analysis_text}"`;
  
  try {
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", // نموذج سريع وفعال من Google
        contents: prompt,
        config: {
            temperature: 0.1, // لضمان دقة منطقية عالية
            responseMimeType: "application/json", // طلب إخراج JSON مباشر
        },
    });

    const aiResponseText = response.text.trim();
    const aiResponseJson = JSON.parse(aiResponseText);

    // إرجاع النتيجة للواجهة الأمامية
    res.status(200).json({
      success: true,
      rationality_index: aiResponseJson.rationality_index,
      detected_fallacies: aiResponseJson.detected_fallacies,
      initial_comment: aiResponseJson.initial_comment,
      full_analysis: aiResponseJson.full_analysis 
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ success: false, error: 'فشل في الاتصال بخدمة الذكاء الاصطناعي.' });
  }
}
