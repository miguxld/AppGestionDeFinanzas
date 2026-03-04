// src/server/application/use-cases/create-savings-section.use-case.ts
import { IFinancialRepository } from "../../domain/repositories/financial.repository";

export interface CreateSavingsSectionInput {
    userId: string;
    name: string;
    purpose?: string;
    strategyType: "FIXED" | "PERCENTAGE" | "GOAL";
    fixedAmount?: number;
    percentage?: number;
    goalAmount?: number;
    goalDate?: Date;
    color?: string;
    emoji?: string;
}

export class CreateSavingsSectionUseCase {
    constructor(private financialRepository: IFinancialRepository) { }

    async execute(input: CreateSavingsSectionInput): Promise<any> {
        return await this.financialRepository.createSavingsSection(input.userId, input);
    }
}
