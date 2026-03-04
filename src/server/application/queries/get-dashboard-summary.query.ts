// src/server/application/queries/get-dashboard-summary.query.ts
import { IFinancialRepository, DashboardSummary } from "../../domain/repositories/financial.repository";

export interface DashboardSummaryInput {
    userId: string;
    month: number;
    year: number;
}

export class GetDashboardSummaryQuery {
    constructor(private financialRepository: IFinancialRepository) { }

    async execute(input: DashboardSummaryInput): Promise<DashboardSummary> {
        return await this.financialRepository.getDashboardSummary(
            input.userId,
            input.month,
            input.year
        );
    }
}
