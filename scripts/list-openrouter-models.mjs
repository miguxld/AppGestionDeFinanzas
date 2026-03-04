import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    console.log("Listing OpenRouter Models...");
    try {
        const response = await fetch("https://openrouter.ai/api/v1/models", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
        });

        const data = await response.json();
        console.log("Status:", response.status);
        if (data.data) {
            console.log("Number of models:", data.data.length);
            // List first 5 models to see structure
            console.log("First 5 models:", JSON.stringify(data.data.slice(0, 5), null, 2));

            // Check if any gemini models are there
            const geminiModels = data.data.filter(m => m.id.toLowerCase().includes('gemini'));
            console.log("Gemini models found:", geminiModels.map(m => m.id));
        } else {
            console.log("Response Data:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Error:", error);
    }
}

listModels();
