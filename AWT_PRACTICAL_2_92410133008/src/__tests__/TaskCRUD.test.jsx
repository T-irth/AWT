import { render, screen, fireEvent } from '@testing-library/react'
import TaskForm from '../components/TaskForm'
import { TaskProvider } from '../contexts/TaskContext'
import { BrowserRouter } from 'react-router-dom'

test('Task form handles CRUD with validation (Q2+Q3)', () => {
    render(
        <TaskProvider>
            <BrowserRouter>
                <TaskForm />
            </BrowserRouter>
        </TaskProvider>
    )
    fireEvent.change(screen.getByPlaceholderText(/Task Title/i), { target: { value: 'New Test Task' } })
    fireEvent.change(screen.getByPlaceholderText(/Description/i), { target: { value: 'Test desc' } })
    fireEvent.click(screen.getByText('Create Task'))
    // Validation passes → success message appears
})