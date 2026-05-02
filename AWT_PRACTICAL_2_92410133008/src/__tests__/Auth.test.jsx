import { render, screen, fireEvent } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import Login from '../components/Login.jsx'
import { AuthProvider } from '../contexts/AuthContext.jsx'

test('Login form validation and simulated JWT (Q4)', () => {
    render(
        <AuthProvider>
            <BrowserRouter>
                <Login />
            </BrowserRouter>
        </AuthProvider>
    )

    useEffect(() => {
            
            const token = localStorage.getItem('token');
            if (token) {
                
                const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
                
            }
        }, [])
    // Fill the form
    fireEvent.change(screen.getByPlaceholderText(/email/i), {
        target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByPlaceholderText(/password/i), {
        target: { value: '123' }
    })

    // Click the Login button specifically (safer way)
    const loginButton = screen.getByRole('button', { name: /login/i })
    fireEvent.click(loginButton)

    // Optional: Check that the Login heading is still visible
    expect(screen.getByRole('heading', { level: 2, name: /login/i })).toBeInTheDocument()
})