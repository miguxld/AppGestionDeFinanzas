import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LoginPage from './page';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Mock Next.js router
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

// Mock next-auth
vi.mock('next-auth/react', () => ({
    signIn: vi.fn(),
}));

describe('LoginPage', () => {
    const mockRouter = {
        push: vi.fn(),
        refresh: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    });

    it('renders the login form correctly', () => {
        render(<LoginPage />);

        expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Contraseña')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('allows users to type in the email and password fields', () => {
        render(<LoginPage />);

        const emailInput = screen.getByLabelText('Correo electrónico');
        const passwordInput = screen.getByLabelText('Contraseña');

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });

        expect(emailInput).toHaveValue('test@example.com');
        expect(passwordInput).toHaveValue('password123');
    });

    it('handles successful login and redirects to dashboard', async () => {
        (signIn as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ error: null });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(signIn).toHaveBeenCalledWith('credentials', {
                email: 'test@example.com',
                password: 'password123',
                redirect: false,
            });
            expect(mockRouter.push).toHaveBeenCalledWith('/');
            expect(mockRouter.refresh).toHaveBeenCalled();
        });
    });

    it('displays an error message when login fails', async () => {
        (signIn as unknown as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ error: 'CredentialsSignin' });

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'wrong@example.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrongpass' } });

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('Credenciales incorrectas. Verifica tu email y contraseña.')).toBeInTheDocument();
            expect(mockRouter.push).not.toHaveBeenCalled();
        });
    });

    it('handles network errors gracefully', async () => {
        (signIn as unknown as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error('Network Error'));

        render(<LoginPage />);

        fireEvent.change(screen.getByLabelText('Correo electrónico'), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(screen.getByText('Error de conexión. Intenta de nuevo.')).toBeInTheDocument();
        });
    });
});
