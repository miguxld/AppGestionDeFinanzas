"use client";

import React, { useState } from "react";
import { AIOrb } from "./AIOrb";
import { AIChatPanel } from "./AIChatPanel";

export const AIContainer: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <AIOrb onClick={() => setIsOpen(true)} isThinking={false} />
            <AIChatPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};
