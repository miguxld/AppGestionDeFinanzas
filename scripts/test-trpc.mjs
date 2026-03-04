// Fetch API script to hit Next.js TRPC endpoint locally
async function run() {
    console.log("Starting Next.js TRPC API Test...");
    const url = 'http://localhost:3000/api/trpc/auth.register';

    // Create a synthetic payload that tRPC's superjson expects
    // Normally tRPC sends input like ?input={"json":{"name":"Tester","email":"test4@example.com","password":"password123"}}
    try {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                json: {
                    name: "Direct API Tester",
                    email: `test-${Date.now()}@example.com`,
                    password: "password123"
                }
            })
        });

        console.log("STATUS:", res.status);
        const text = await res.text();
        console.log("RESPONSE:", text);

        try {
            const json = JSON.parse(text);
            if (json.error) {
                console.log("TRPC ERROR CODE:", json.error.json.code);
                console.log("TRPC ERROR MESSAGE:", json.error.json.message);
            }
        } catch (e) { }

    } catch (e) {
        console.error("Fetch failed entirely:", e);
    }
}

run();
