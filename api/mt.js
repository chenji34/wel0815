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
        // 使用原生 FormData 建立正確的 multipart/form-data 請求
        const formData = new FormData();
        formData.append('text', text || '');
        formData.append('dialectCode', dialect || 'sixian');
        formData.append('targetCode', 'zh-TW');
        formData.append('engine', 'model');

        const response = await fetch("https://api.gohakka.org/v3/pro/text/translations", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${TOKEN}`
                // 注意：使用原生 FormData 時，fetch 會自動設定正確的 multipart/form-data 帶 boundary 的 Content-Type
            },
            body: formData
        });

        const responseText = await response.text();
        
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            data = { error: "API 回傳了非 JSON 格式的內容", rawResponse: responseText };
        }

        return res.status(response.status).json(data);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
