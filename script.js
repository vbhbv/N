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

            // 1. عرض مؤشر التحميل
            loadingIndicator.classList.remove('hidden');
            initialResultDiv.classList.add('hidden');
            analyzeButton.disabled = true;

            // 2. إرسال النص إلى API الذكاء الاصطناعي (هنا يتم الاتصال بالخدمة السحابية)
            try {
                // *** هذا هو المكان الذي تتصل فيه بخدمة AI API الخاصة بك ***
                // مثال: استدعاء دالة تقوم بـ fetch لـ Hugging Face أو OpenAI
                const response = await callAIFallacyDetector(text);
                
                // 3. عرض النتيجة الأولية
                if (response.success) {
                    const score = response.rationality_index; // مثال: 75
                    const fallacies = response.detected_fallacies.join(', '); // مثال: مغالطة رجل القش
                    
                    initialScore.innerHTML = `مقياسك الأولي: <strong>${score}%</strong>.<br> تم اكتشاف مغالطات شائعة مثل: ${fallacies}.`;
                    
                    initialResultDiv.classList.remove('hidden');
                } else {
                    alert('عذراً، حدث خطأ في تحليل الذكاء الاصطناعي. الرجاء المحاولة لاحقاً.');
                }
            } catch (error) {
                console.error('Error calling AI API:', error);
                alert('فشل الاتصال بخدمة التحليل.');
            } finally {
                // 4. إخفاء التحميل وتمكين الزر
                loadingIndicator.classList.add('hidden');
                analyzeButton.disabled = false;
            }
        });
    }
});

// دالة وهمية لمحاكاة استدعاء الـ AI API
// يجب استبدالها برمز حقيقي يتصل بخادمك أو خدمة سحابية
async function callAIFallacyDetector(text) {
    // محاكاة تأخير الشبكة (3 ثوانٍ)
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    
    // محاكاة الاستجابة من الذكاء الاصطناعي
    // في الواقع، يتم إرسال النص إلى الخادم الذي يشغل نموذج NLP
    const sampleResponse = {
        success: true,
        rationality_index: Math.floor(Math.random() * (90 - 50 + 1)) + 50, // نقاط عشوائية
        detected_fallacies: ["مغالطة التعميم المتسرع", "الهجوم الشخصي"],
        full_analysis_id: "report-12345" // معرف التقرير الكامل
    };
    return sampleResponse;
}

// دالة لتتبع التحويل (يمكنك استخدام Google Analytics أو أي أداة تتبع)
function trackConversion() {
    console.log('User clicked Telegram join button. Conversion tracking fired.');
    // هنا تضع كود تتبع التحويل الفعلي (مثال: gtag('event', 'telegram_join');)
}
