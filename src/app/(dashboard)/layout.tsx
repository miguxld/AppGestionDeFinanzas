// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { AIContainer } from "@/components/ai/AIContainer";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen overflow-hidden bg-[#060912]">
            {/* ── Sidebar ── */}
            <Sidebar />

            {/* ── Main content wrapper ── */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                {/* ── Header ── */}
                <Header />

                {/* ── Scrollable main area ── */}
                <main className="flex-1 overflow-y-auto scrollbar-hide py-8 lg:py-12">
                    <div className="animate-fade-in px-4 lg:px-10">
                        {children}
                    </div>
                </main>
            </div>

            {/* ── AI Assistant ── */}
            <AIContainer />

            {/* Decorative background spots */}
            <div className="fixed top-0 right-0 w-[800px] h-[800px] bg-blue-600/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 left-[20%] w-[600px] h-[600px] bg-violet-600/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />
        </div>
    );
}
