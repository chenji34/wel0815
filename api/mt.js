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
        const response = await fetch("https://api.gohakka.org/v3/pro/mt", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ text, dialect })
        });

        // 取得原始文字回應，避免直接 parse JSON 失敗崩潰
        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            // 如果不是合法的 JSON，把原始文字當作錯誤回傳給前端看
            data = { error: "API 回傳了非 JSON 格式的內容", rawResponse: responseText };
        }

        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
