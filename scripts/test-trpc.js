// test-trpc-registration.js
const fetch = require('node-fetch');

async function testRegistration() {
    console.log("Testing POST to tRPC auth.register...");
    try {
        const response = await fetch('http://localhost:3000/api/trpc/auth.register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // tRPC expects data wrapped in { "json": { ... } }
            body: JSON.stringify({
                json: {
                    name: "QA Node Tester",
                    email: "qa-node-" + Date.now() + "@test.com",
                    password: "password123"
                }
            })
        });

        console.log("Status Code:", response.status);
        const data = await response.text();
        console.log("Response Body:", data);
    } catch (e) {
        console.error("Test failed:", e.message);
    }
}

testRegistration();
