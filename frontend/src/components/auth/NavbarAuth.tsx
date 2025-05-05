import { useAuth } from '@/hooks/useAuth';
import authService from '@/services/auth/authService';
import { useState, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import NotificationButton from '../ui/admin/NotificationButton';
import { FaArrowRightFromBracket } from 'react-icons/fa6';
import { Settings } from '@mui/icons-material';
import { FaShoppingCart } from 'react-icons/fa';

interface NavbarProp {
    cartCount: number
}

export default function NavbarAuth({ cartCount }: NavbarProp) {
    const { logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname.startsWith(path);


    const navigate = useNavigate();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const handleLogout = async () => {
        try {
            await authService.logoutUser();
            console.log(" logged out successfully.");
            logout();
            navigate('/');
        } catch (error) {
            console.error("Failed to logout:", error);
        }
    };

    const handleToCarts = () => {
        navigate('/carts')
    }


    return (
        <header className="bg-white sticky top-0 z-50 shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div className="flex">
                        <Link to="/dashboard" className="text-xl font-bold text-utama">
                            E-Shop
                        </Link>
                    </div>

                    {/* Center Menu */}
                    <nav className="hidden md:flex space-x-6">
                        <Link
                            to="/dashboard"
                            className={`text-md font-semibold transition ${isActive("/dashboard") ? "text-utama font-bold" : "text-gray-600 text-utama-hover"}`}
                        >
                            Home
                        </Link>
                        <Link
                            to="/products"
                            className={`text-md font-semibold transition ${isActive("/products") ? "text-utama font-bold" : "text-gray-600 text-utama-hover"}`}
                        >
                            Products
                        </Link>
                    </nav>

                    {/* Right Side - Chart, Notification, Avatar */}
                    <div className="flex items-center space-x-4">
                        {/* Chart Icon */}
                        <div className="relative">
                            <button className="p-2.5 transition rounded-full text-slate-600 hover:bg-white hover:shadow-lg hover:text-gray-900 relative" onClick={handleToCarts}>
                                <FaShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                        <NotificationButton />

                        {/* Avatar */}
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={toggleDropdown}
                                className="flex items-center focus:outline-none"
                            >
                                <img
                                    src={`/img/profile.png`}
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full object-cover "
                                />
                            </button>

                            {/* Avatar Dropdown */}
                            {dropdownOpen && (
                                <div className="absolute z-50 right-0 p-4 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-100">
                                    <ul className="text-sm text-gray-600">
                                        <li
                                            onClick={() => navigate('/profile')}
                                            className="flex items-center rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <img src={`/img/profile.png`} alt="User Avatar" className="w-5 h-5 object-cover mr-2" />
                                            <span>My Profile</span>
                                        </li>
                                        <li
                                            onClick={() => navigate('/setting')}
                                            className="flex items-center rounded-md p-3 hover:bg-gray-100 cursor-pointer"
                                        >
                                            <Settings className='mr-3' />
                                            <span>Setting</span>
                                        </li>
                                        <hr className="flex bg-slate-600 my-2" />
                                        <li
                                            onClick={handleLogout}
                                            className="flex items-center bg-gradient-to-r from-rose-500 via-rose-500 to-red-600 text-white rounded-md p-3 hover:brightness-110 cursor-pointer"
                                        >
                                            <FaArrowRightFromBracket className="h-5 w-5 mr-2" />
                                            <span>Logout</span>
                                        </li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
