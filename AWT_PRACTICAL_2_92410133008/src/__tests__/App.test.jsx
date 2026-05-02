import { render, screen } from '@testing-library/react'
import App from '../App.jsx'
import { AuthProvider } from '../contexts/AuthContext.jsx'
import { TaskProvider } from '../contexts/TaskContext.jsx'

test('App renders with providers and router (Q1)', () => {
    render(
        <AuthProvider>
            <TaskProvider>
                <App />
            </TaskProvider>
        </AuthProvider>
    )

    // Check that the app title from .env is rendered via Navbar
    expect(screen.getByText(/Task Management System/i)).toBeInTheDocument()
})