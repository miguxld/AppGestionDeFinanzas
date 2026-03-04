import dotenv from 'dotenv';
dotenv.config();

async function testAI() {
    console.log("Testing AI Router Logic...");
    console.log("Key present:", !!process.env.OPENROUTER_API_KEY);
    console.log("Key prefix:", process.env.OPENROUTER_API_KEY ? process.env.OPENROUTER_API_KEY.substring(0, 10) : "NONE");

    const question = "Hola, ¿cuál es mi flujo de caja?";
    const context = "Contexto Financiero de Prueba: Ingresos 1000, Gastos 500.";

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [
                    { role: "system", content: context },
                    { role: "user", content: question }
                ],
            }),
        });

        const data = await response.json();
        console.log("Response Status:", response.status);
        console.log("Response Data:", JSON.stringify(data, null, 2));
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

testAI();
