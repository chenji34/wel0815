export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, dialect } = req.body;
    const TOKEN = "ghk_2a3229ebcmw0ae6vl00idq6eb17s3gfee";

    try {
        const formData = new FormData();
        formData.append('text', text || '');
        formData.append('dialectCode', dialect || 'sixian');
        formData.append('targetCode', 'zh-TW');
        formData.append('engine', 'model');

        const response = await fetch("https://api.gohakka.org/v3/pro/text/translations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`
            },
            body: formData
        });

        const responseText = await response.text();
        let apiData;
        try {
            apiData = JSON.parse(responseText);
        } catch (e) {
            return res.status(response.status).json({ error: "API 回傳了非 JSON 格式的內容", rawResponse: responseText });
        }

        // 💡 客語常見錯別字與不標準用字檢核字典（可依需求擴充）
        const typoRules = [
            { wrong: "嘸過", correct: "毋過", desc: "表示轉折，教育部標準字應為「毋過」" },
            { wrong: "無過", correct: "毋過", desc: "表示轉折，教育部標準字應為「毋過」" },
            { wrong: "仰安", correct: "仰般", desc: "詢問如何、怎樣，應使用「仰般」" },
            { wrong: "按呢", correct: "恁呢", desc: "這樣、如此之意，標準客語多用「恁呢」" },
            { wrong: "知影", correct: "知", desc: "部分腔調口語常說知影，正式書寫建議用「知」或對應辭典用字" }
        ];

        let detectedTypos = [];
        if (text) {
            typoRules.forEach(rule => {
                if (text.includes(rule.wrong)) {
                    detectedTypos.push({
                        wrong: rule.wrong,
                        correct: rule.correct,
                        description: rule.desc
                    });
                }
            });
        }

        // 將翻譯結果與錯別字檢核結果合併回傳
        const finalResult = {
            ...apiData,
            proofreading: {
                typosCount: detectedTypos.length,
                typos: detectedTypos
            }
        };

        return res.status(200).json(finalResult);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
