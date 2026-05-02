import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();     
    useEffect(() => {
        

        const token = localStorage.getItem('token');
        if (token) {
           
            const user = { name: 'Tirth', email: 'Tirth.Kothadiya@example.com' };
            
        }
    }, [])

};
export default Register;