import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    console.log("Conectando a Neon Serverless...")
    const hashedPassword = await bcrypt.hash("password123", 12)

    try {
        const user = await prisma.user.create({
            data: {
                name: "QA Tester",
                email: "qa@test.com",
                passwordHash: hashedPassword,
            },
        })
        console.log("¡Usuario creado exitosamente en Neon!")
        console.dir(user)
    } catch (e: any) {
        if (e.code === 'P2002') {
            console.log("El usuario qa@test.com ya existe en la base de datos.");
        } else {
            console.error("Error fatal conectando o escribiendo a la BD:", e.message)
        }
    } finally {
        await prisma.$disconnect()
    }
}

main()
