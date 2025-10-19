// ملف: api/analyze.js (تم التعديل لاستخدام CommonJS وتصحيح الإخراج)

// 1. استخدام require بدلاً من import
const { GoogleGenAI } = require('@google/genai');

// 2. قراءة المفتاح من متغيرات البيئة (التي تم تخزينها بأمان في Netlify)
const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY, 
});

// 3. تعريف دالة المعالج (الـ Handler) - يجب استخدام exports.handler
exports.handler = async function(event, context) {
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // يتم تمرير الجسم كـ event.body (سلسلة نصية) في Netlify
    let data;
    try {
        data = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON format' })
        };
    }

    const { analysis_text } = data;

    if (!analysis_text || analysis_text.length < 50) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'الرجاء إرسال نص كافٍ للتحليل.' })
        };
    }

    const prompt = `أنت خبير في الفلسفة والمنطق. مهمتك هي تحليل النص العربي المُقدم وتحديد المغالطات المنطقية الرئيسية (مثل رجل القش، الهجوم الشخصي، التعميم المتسرع، التوسل بالسلطة) وتقييم جودة الاستدلال. قم بتوليد إجابة في صيغة JSON فقط تحتوي على: 
    1. rationality_index: (عدد صحيح من 0 إلى 100). 
    2. detected_fallacies: (مصفوفة من أسماء المغالطات).
    3. initial_comment: (تعليق أولي مقتضب).
    4. full_analysis: (تحليل مفصل وموسع).
    
    النص لتحليله: "${analysis_text}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.1,
                responseMimeType: "application/json",
            },
        });

        const aiResponseText = response.text.trim();
        
        // ********************************************
        // * تصحيح استخراج JSON (لضمان الموثوقية) *
        // ********************************************
        const jsonStart = aiResponseText.indexOf('{');
        const jsonEnd = aiResponseText.lastIndexOf('}') + 1;
        
        if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error('فشل الذكاء الاصطناعي في توليد صيغة JSON صالحة.');
        }
        
        const cleanJsonString = aiResponseText.substring(jsonStart, jsonEnd);
        const aiResponseJson = JSON.parse(cleanJsonString);

        // إرجاع النتيجة بنجاح (صيغة Netlify Function)
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                success: true,
                rationality_index: aiResponseJson.rationality_index,
                detected_fallacies: aiResponseJson.detected_fallacies,
                initial_comment: aiResponseJson.initial_comment,
                full_analysis: aiResponseJson.full_analysis 
            }),
        };

    } catch (error) {
        console.error('Gemini API Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, error: 'فشل في الاتصال بخدمة الذكاء الاصطناعي.' })
        };
    }
};
