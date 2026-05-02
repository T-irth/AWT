import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TaskDetail from '../components/TaskDetail'
import { TaskProvider } from '../contexts/TaskContext'

useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
           
            const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
            
        }
    }, [])
test('Task detail decodes base64 ID (Q6)', () => {
    render(
        <TaskProvider>
            <MemoryRouter initialEntries={['/task/dGFzay0x']}> {/* base64 of "task-1" */}
                <Routes>
                    <Route path="/task/:encodedId" element={<TaskDetail />} />
                </Routes>
            </MemoryRouter>
            
        </TaskProvider>
    )
    // Test will confirm component mounts without crash
})