const { chromium } = require('playwright');

(async () => {
    console.log("Starting QA Test for Registration Flow...");
    const browser = await chromium.launch();
    const page = await browser.newPage();

    try {
        console.log("Navigating to register page...");
        await page.goto('http://localhost:3001/register');

        console.log("Filling form...");
        await page.fill('input[name="name"]', 'QA Test');
        await page.fill('input[name="email"]', 'qatest8@example.com');
        await page.fill('input[name="password"]', 'password123');

        console.log("Submitting...");
        const responsePromise = page.waitForResponse(response => response.url().includes('/api/') || response.url().includes('register'));

        await page.click('button[type="submit"]');

        const response = await responsePromise;
        console.log("API Response Status:", response.status());
        const text = await response.text();
        console.log("API Response Body:", text);

        await page.waitForTimeout(2000);
        console.log("Form submission complete. Checking for client-side errors...");

        // Check for any visible toast errors
        const toasts = await page.$$eval('[data-sonner-toast]', el => el.map(e => e.textContent));
        if (toasts.length > 0) {
            console.log("UI TOAST ERRORS DETECTED:", toasts);
        } else {
            console.log("Registration seemingly successful on UI.");
        }

    } catch (e) {
        console.error("Test Failed:", e);
    } finally {
        await browser.close();
    }
})();
