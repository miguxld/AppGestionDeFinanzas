import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIChatPanel } from './AIChatPanel';

const mockMutate = vi.fn();

// Mock tRPC
vi.mock('@/trpc/react', () => ({
    api: {
        ai: {
            ask: {
                useMutation: () => ({
                    mutate: mockMutate,
                    isPending: false,
                }),
            },
        },
    },
}));

// Mock framer-motion to bypass animation delays in tests
vi.mock('framer-motion', async () => {
    const actual = await vi.importActual('framer-motion') as any;
    return {
        ...actual,
        AnimatePresence: ({ children }: any) => <>{children}</>,
        motion: {
            ...actual.motion,
            div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
        },
    };
});

describe('AIChatPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Mock scrollIntoView and other layout methods that don't exist in happy-dom
        Element.prototype.scrollIntoView = vi.fn();
    });

    it('does not render when isOpen is false', () => {
        render(<AIChatPanel isOpen={false} onClose={vi.fn()} />);
        expect(screen.queryByText('TheOneShot AI')).not.toBeInTheDocument();
    });

    it('renders correctly when isOpen is true', () => {
        render(<AIChatPanel isOpen={true} onClose={vi.fn()} />);
        // Initial greeting message
        expect(screen.getByText(/¡Hola! Soy tu asistente de TheOneShot./i)).toBeInTheDocument();
        // Header title
        expect(screen.getByText('TheOneShot AI')).toBeInTheDocument();
        // Input placeholder
        expect(screen.getByPlaceholderText('Escribe tu consulta financiera...')).toBeInTheDocument();
    });

    it('calls onClose when close button or backdrop is clicked', () => {
        const onCloseMock = vi.fn();
        const { container } = render(<AIChatPanel isOpen={true} onClose={onCloseMock} />);

        // Find the backdrop
        const backdrop = container.querySelector('.fixed.inset-0.bg-black\\/40');
        if (backdrop) {
            fireEvent.click(backdrop);
            expect(onCloseMock).toHaveBeenCalledTimes(1);
        }

        // We can't easily query the Lucide X icon without a testid, but we know it's a button.
        // Assuming it's the first ghost button in the header.
        const buttons = screen.getAllByRole('button');
        // The first button should be the close button (the second is the send button)
        fireEvent.click(buttons[0]);
        expect(onCloseMock).toHaveBeenCalledTimes(2);
    });

    it('allows typing and sending a message', async () => {
        render(<AIChatPanel isOpen={true} onClose={vi.fn()} />);

        const input = screen.getByPlaceholderText('Escribe tu consulta financiera...');

        // Type a message
        fireEvent.change(input, { target: { value: '¿Cuánto he gastado?' } });
        expect(input).toHaveValue('¿Cuánto he gastado?');

        // Send the message
        const buttons = screen.getAllByRole('button');
        // Send button is the second one
        fireEvent.click(buttons[1]);

        await waitFor(() => {
            // Verify message is added to the UI
            expect(screen.getByText('¿Cuánto he gastado?')).toBeInTheDocument();
            // Verify input is cleared
            expect(input).toHaveValue('');
            // Verify mutation is called with correct arguments
            expect(mockMutate).toHaveBeenCalledWith({ question: '¿Cuánto he gastado?' });
        });
    });

    it('allows sending a message using the Enter key', async () => {
        render(<AIChatPanel isOpen={true} onClose={vi.fn()} />);

        const input = screen.getByPlaceholderText('Escribe tu consulta financiera...');

        // Type a message
        fireEvent.change(input, { target: { value: 'Test enter key' } });

        // Press Enter
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        await waitFor(() => {
            expect(screen.getByText('Test enter key')).toBeInTheDocument();
            expect(mockMutate).toHaveBeenCalledWith({ question: 'Test enter key' });
        });
    });

    it('does not send empty messages', () => {
        render(<AIChatPanel isOpen={true} onClose={vi.fn()} />);

        const input = screen.getByPlaceholderText('Escribe tu consulta financiera...');
        const buttons = screen.getAllByRole('button');
        const sendButton = buttons[1];

        // Ensure button is disabled when empty
        expect(sendButton).toBeDisabled();

        // Try sending whitespace
        fireEvent.change(input, { target: { value: '   ' } });
        expect(sendButton).toBeDisabled();

        fireEvent.click(sendButton);
        expect(mockMutate).not.toHaveBeenCalled();
    });
});
