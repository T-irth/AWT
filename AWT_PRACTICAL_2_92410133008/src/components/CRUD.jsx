import { useState, useEffect, use } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTasks } from '../contexts/TaskContext'


const CRUD = () => {
    return <div>CRUD Operations - Student to implement</div>;
    useEffect(() => {
        
        const token = localStorage.getItem('token');
        if (token) {
           
            const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
            
        }
const TaskDetail = () => {
    // Q6: Dynamic routing with base64 encoded ID + decode in useEffect
    return <div>Task Detail Page - Student to implement base64 decoding</div>;
};
    }, [])

};