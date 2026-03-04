import { z } from "zod";
import { router, protectedProcedure } from "@/server/api/trpc";

export const aiRouter = router({
    ask: protectedProcedure
        .input(z.object({ question: z.string() }))
        .mutation(async ({ ctx, input }) => {
            // 1. Get Financial Context
            const transactions = await ctx.db.financialTransaction.findMany({
                where: { userId: ctx.session.user.id },
                orderBy: { occurredAt: "desc" },
                take: 20,
            });

            const savings = await ctx.db.savingsSection.findMany({
                where: { userId: ctx.session.user.id },
            });

            // Simple summary for the prompt
            const summary = transactions.reduce((acc: any, t: any) => {
                const amt = Number(t.amount);
                if (t.type === 'INCOME') acc.income += amt;
                else acc.expense += amt;
                return acc;
            }, { income: 0, expense: 0 });

            const savingsInfo = savings.map((s: any) => `${s.name}: ${s.currentBalance}/${s.goalAmount || 'N/A'}`).join(', ');

            const context = `
        Contexto Financiero del Usuario:
        - Ingresos totales recientes (últimos 20 mov): ${summary.income} COP
        - Gastos totales recientes (últimos 20 mov): ${summary.expense} COP
        - Flujo de Caja Ordinario Estimado: ${summary.income - summary.expense} COP
        - Secciones de Ahorro: ${savingsInfo || 'Ninguna'}
        
        Instrucciones: Eres TheOneShot AI, un asesor financiero sofisticado y directo. 
        Responde de forma concisa, profesional y analítica. Habla siempre en español.
        No des consejos legales, solo financieros basados en los datos.
      `;

            // 2. Call AI (OpenRouter)
            try {
                console.log("Calling OpenRouter with model: google/gemini-flash-1.5");
                const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                        "HTTP-Referer": "http://localhost:3000", // Optional, for OpenRouter analytics
                        "X-Title": "TheOneShot Finance", // Optional
                    },
                    body: JSON.stringify({
                        model: "google/gemini-2.0-flash-001",
                        messages: [
                            { role: "system", content: context },
                            { role: "user", content: input.question }
                        ],
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error("OpenRouter API Error:", response.status, errorData);
                    throw new Error(`OpenRouter returned ${response.status}: ${JSON.stringify(errorData)}`);
                }

                const data = (await response.json()) as any;

                if (!data.choices?.[0]?.message?.content) {
                    console.error("Unexpected OpenRouter Response Format:", data);
                    throw new Error("Invalid response format from AI provider");
                }

                const answer = data.choices[0].message.content as string;
                return { answer };
            } catch (error: any) {
                console.error("AI Router Error:", error);
                return {
                    answer: "Lo siento, hubo un error técnico al conectar con mi cerebro artificial. Por favor, verifica tu conexión o intenta de nuevo más tarde.",
                    error: error.message
                };
            }
        }),
});
