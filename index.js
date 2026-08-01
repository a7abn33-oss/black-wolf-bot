const TelegramBot = require('node-telegram-bot-api');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const http = require('http');

// البيانات الخاصة بك
const TELEGRAM_TOKEN = '8983140908:AAF35abyBvBbSlGcLihTgyYS0JNP0bxtDW8';
const GEMINI_API_KEY = 'AIzaSyBEpUe1ejwBOW_YibL0zDyRkvQONjKf25I';

// تهيئة البوت والـ AI
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// سيرفر وهمي بسيط عشان Render ما يقفلش الخدمة
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Black Wolf AI Bot is Active!');
}).listen(PORT);

console.log('🤖 Black Wolf Bot is running...');

// استقبال الصور
bot.on('photo', async (msg) => {
    const chatId = msg.chat.id;

    try {
        await bot.sendMessage(chatId, '🐺 جاري تحليل الشارت بأقوى معايير SMC/ICT... انتظر لحظات.');

        // جلب أعلى دقة للصورة
        const fileId = msg.photo[msg.photo.length - 1].file_id;
        const fileUrl = await bot.getFileLink(fileId);

        // تحويل الصورة لـ Base64
        const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data).toString('base64');

        // البرومبت المؤسسي الصارم
        const promptText = `
أنت الآن "محلل ومؤشر تداول مؤسسي محترف" متخصص حصرياً في الذهب (XAUUSD)، تجمع بين مفاهيم الأموال الذكية (SMC/ICT) والدقة السعرية (Price Action) والتحليل الكمي.

مهمتك استخراج إشارات دخول/خروج عالية الاحتمالية بنسبة نجاح تتجاوز 85% مع إدارة مخاطر صارمة بناءً على الشارت المرفق.

إذا تحققت الشروط الصارمة، قم بصياغة الإجابة في جدول/قائمة منسقة بقراءات دقيقة تشمل:
- القرار: (شراء BUY / بيع SELL / استبعاد INVALID)
- سبب الاستبعاد (إذا كانت التوصية INVALID)
- منطقة الدخول (Entry)
- وقف الخسارة (Stop Loss) (2-5 دولارات كحد أقصى)
- الهدف الأول (TP1) (+2.5$)
- الهدف الثاني (TP2) (+5$)
- نسبة المخاطرة للعائد (R:R)
- النمط وهيكل السوق (CHOCH / BOS)
- مسح السيولة (Liquidity Sweep)
- المنطقة المؤسسية (Order Block / FVG)

إذا كانت الصفقة غير مطابقة لشروط SMC الصارمة، اذكر بوضوح أن السوق لا يصلح للدخول واذكر السبب.
صغ الإجابة باللغة العربية بأسلوب منظم وواضح جداً في رسالة تليجرام.
`;

        // استدعاء Gemini 2.5 Flash للمستقر
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent([
            promptText,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: 'image/jpeg'
                }
            }
        ]);

        const analysisText = result.response.text();

        // إرسال التحليل للمستخدم
        await bot.sendMessage(chatId, analysisText);

    } catch (error) {
        console.error(error);
        await bot.sendMessage(chatId, '❌ حدث خطأ أثناء تحليل الصورة، يرجى المحاولة مرة أخرى.');
    }
});
