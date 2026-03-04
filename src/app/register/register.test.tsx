import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RegisterPage from './page';
import { useRouter } from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

const mockMutate = vi.fn();

// Mock tRPC
vi.mock('@/trpc/react', () => ({
    api: {
        auth: {
            register: {
                useMutation: () => ({
                    mutate: mockMutate,
                    isPending: false,
                }),
            },
        },
    },
}));

describe('RegisterPage', () => {
    const mockRouter = {
        push: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    });

    it('renders the register form correctly', () => {
        render(<RegisterPage />);

        expect(screen.getByText('Crea tu cuenta')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /comenzar gratis/i })).toBeInTheDocument();
    });

    it('allows users to type in the name, email, and password fields', () => {
        render(<RegisterPage />);

        const nameInput = screen.getByLabelText('Nombre Completo');
        const emailInput = screen.getByLabelText('Correo Electrónico');
        const passwordInput = screen.getByLabelText('Contraseña');

        fireEvent.change(nameInput, { target: { value: 'John Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(nameInput).toHaveValue('John Doe');
        expect(emailInput).toHaveValue('john@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('calls tRPC mutation on form submit', async () => {
        render(<RegisterPage />);

        fireEvent.change(screen.getByLabelText('Nombre Completo'), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText('Correo Electrónico'), { target: { value: 'JOHN@example.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /comenzar gratis/i }));

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith({
                name: 'John Doe',
                email: 'john@example.com', // Should be lowercased
                password: 'password123',
            });
        });
    });
});
