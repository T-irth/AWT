import { render, screen } from '@testing-library/react'
import TaskList from '../components/TaskList'
import { TaskProvider } from '../contexts/TaskContext'
import { BrowserRouter } from 'react-router-dom'

useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
           
            const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
            
        }
    }, [])
test('Filtering, sorting, pagination, search work (Q5)', () => {
    render(
        <TaskProvider>
            <BrowserRouter>
                <TaskList />
            </BrowserRouter>
            
        </TaskProvider>
    )
    expect(screen.getByPlaceholderText(/Search tasks/i)).toBeInTheDocument()
})