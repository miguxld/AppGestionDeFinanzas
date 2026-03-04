import { NextResponse } from 'next/server';
import { db } from '@/server/infrastructure/db/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        console.log("TESTING PRISMA CONNECTION...");

        // 1. Try a simple read
        const userCount = await db.user.count();
        console.log("Current user count:", userCount);

        // 2. Try a write
        const testEmail = `diagnostic-${Date.now()}@test.com`;
        const passwordHash = await bcrypt.hash("password123", 10);

        console.log("Attempting to write test user:", testEmail);
        const newUser = await db.user.create({
            data: {
                name: "Diagnostic Test",
                email: testEmail,
                passwordHash,
                baseCurrency: "COP"
            }
        });

        return NextResponse.json({
            success: true,
            message: "Database connection successful! Write complete.",
            count: userCount,
            newUser
        });

    } catch (error: any) {
        console.error("PRISMA ERROR DETECTED:", error);
        return NextResponse.json({
            success: false,
            message: "Database connection or write failed.",
            error: error.message,
            code: error.code,
            meta: error.meta
        }, { status: 500 });
    }
}
