import { jwtDecode } from 'jwt-decode';
import store from '../redux/store';
import { logout } from '../redux/authSlice';

export const checkTokenExpiration = () => {
    const token = localStorage.getItem('token');
    if (token) {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
            // Token has expired
            store.dispatch(logout());
            window.location.href = '/login';
            return false;
        }
        return true;
    }
    return false;
}; 