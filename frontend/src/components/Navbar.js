import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/authSlice';

const Navbar = () => {
    const { role } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <nav>
            <ul>
                {role === 'customer' && (
                    <>
                        <li><Link to="/customer">Dashboard</Link></li>
                        <li><Link to="/customer-profile">Profile</Link></li>
                    </>
                )}
                {role === 'admin' && (
                    <>
                        <li><Link to="/admin">Dashboard</Link></li>
                        <li><Link to="/manage-customers">Manage Customers</Link></li>
                    </>
                )}
                {role === 'superadmin' && (
                    <>
                        <li><Link to="/superadmin">Dashboard</Link></li>
                        <li><Link to="/manage-admins">Manage Admins</Link></li>
                        <li><Link to="/all-users">All Users</Link></li>
                    </>
                )}
                <li>
                    <button onClick={handleLogout}>Logout</button>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
