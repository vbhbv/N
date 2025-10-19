document.addEventListener('DOMContentLoaded', () => {
    const analyzeButton = document.getElementById('analyze-button');
    const inputText = document.getElementById('input-text');
    const initialResultDiv = document.getElementById('initial-result');
    const loadingIndicator = document.getElementById('loading-indicator');
    const initialScore = document.getElementById('initial-score');

    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            const text = inputText.value.trim();

            if (text.length < 50) {
                alert("الرجاء إدخال نص جدلي أكبر قليلاً (50 كلمة على الأقل) لضمان تحليل دقيق.");
                return;
            }

            // 1. الإجراء الفوري: إظهار التحميل وإلغاء تفعيل الزر
            loadingIndicator.classList.remove('hidden');
            initialResultDiv.classList.add('hidden');
            analyzeButton.disabled = true;

            // 2. إرسال النص إلى API الذكاء الاصطناعي
            try {
                // الاتصال بوظيفة Serverless في مسار /api/analyze
                const response = await callAIFallacyDetector(text);
                
                // 3. عرض النتيجة في حالة النجاح
                if (response.success) {
                    const score = response.rationality_index;
                    const comment = response.initial_comment || 'تم تحليل نمط تفكيرك بنجاح.';
                    
                    initialScore.innerHTML = `مقياسك الأولي: <strong>${score}%</strong>.<br> ${comment}`;
                    
                    initialResultDiv.classList.remove('hidden');
                } else {
                    // رسالة خطأ إذا فشلت الوظيفة رغم نجاح الاتصال
                    alert('عذراً، حدث خطأ داخلي في تحليل الذكاء الاصطناعي. قد تكون المشكلة في تنسيق JSON العائد.');
                }
            } catch (error) {
                // رسالة خطأ إذا فشل الاتصال بالخادم
                console.error('Error calling AI API:', error);
                alert('فشل الاتصال بخدمة التحليل. يرجى مراجعة سجلات النشر على Netlify للتحقق من خطأ الـ API Key أو الإعدادات.');
            } finally {
                // 4. الإجراء الحتمي: إخفاء التحميل وإعادة تفعيل الزر
                loadingIndicator.classList.add('hidden');
                analyzeButton.disabled = false;
            }
        });
    }
});

// دالة الاتصال بالـ Serverless Function
async function callAIFallacyDetector(text) {
    const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        // يجب إرسال النص ضمن كائن JSON
        body: JSON.stringify({ analysis_text: text })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
        // إذا كان هناك خطأ في الخادم (500) أو لم يعد success: true
        throw new Error(data.error || 'فشل الاتصال بخدمة التحليل.');
    }

    // تخزين التحليل الكامل في التخزين المحلي قبل إرجاع النتيجة
    localStorage.setItem('full_analysis_report', data.full_analysis);

    return data;
}

// دالة لتتبع التحويل (يمكنك استخدامها في analysis.html)
function trackConversion() {
    console.log('User clicked Telegram join button. Conversion tracking fired.');
}
