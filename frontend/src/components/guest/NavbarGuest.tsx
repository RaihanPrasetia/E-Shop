import { Link } from 'react-router-dom';
import { useState } from 'react';
import { HiChevronDown } from 'react-icons/hi';

export default function NavbarGuest() {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);  // Menambahkan state untuk membuka/tutup dropdown

    const handleScroll = (e: React.MouseEvent<HTMLElement>, target: string) => {
        e.preventDefault();
        const element = document.getElementById(target);
        if (element) {
            window.scrollTo({
                top: element.offsetTop - (target === 'home' ? 0 : 100), // Apply offset for all except 'home'
                behavior: 'smooth',
            });
        }
    };

    const handleMenuClick = () => {
        setMenuOpen(prevState => !prevState);  // Toggle state dropdown menu
    };

    return (
        <header className="bg-slate-50 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo */}
                    <div className="flex w-full">
                        <Link to="/" className="text-xl font-bold text-utama">
                            E-Shop
                        </Link>
                    </div>

                    {/* Menu */}
                    <nav className="hidden md:flex space-x-6 w-full justify-center">
                        <button
                            className="text-gray-700 text-utama-hover font-semibold transition"
                            onClick={(e) => handleScroll(e, 'home')}
                        >
                            Beranda
                        </button>
                        <button
                            className="text-gray-700 text-utama-hover font-semibold transition"
                            onClick={(e) => handleScroll(e, 'products')}
                        >
                            Produk
                        </button>

                        {/* Layanan Dropdown */}
                        <div className="relative">
                            <button
                                onClick={handleMenuClick}
                                className="text-gray-700 flex items-center space-x-4 text-utama-hover font-semibold transition"
                            >
                                Layanan
                                <HiChevronDown className=' text-purple-500 text-xl' />
                            </button>
                            {/* Dropdown Menu */}
                            {menuOpen && (
                                <div className="absolute left-0 mt-2 w-48 bg-white shadow-md rounded-md">
                                    <button
                                        onClick={(e) => {
                                            handleScroll(e, 'benfits');
                                            setMenuOpen(false);  // Tutup dropdown setelah item dipilih
                                        }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 bg-utama-hover hover:text-white hover:rounded-t-md"
                                    >
                                        Kenapa Kami
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            handleScroll(e, 'layananKami');
                                            setMenuOpen(false);  // Tutup dropdown setelah item dipilih
                                        }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 bg-utama-hover hover:text-white"
                                    >
                                        Layanan Kami
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            handleScroll(e, 'tentangKami');
                                            setMenuOpen(false);  // Tutup dropdown setelah item dipilih
                                        }}
                                        className="block w-full text-left px-4 py-2 text-gray-700 bg-utama-hover hover:text-white hover:rounded-b-md"
                                    >
                                        Tentang Kami
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            className="text-gray-700 text-utama-hover font-semibold transition"
                            onClick={(e) => handleScroll(e, 'contact')}
                        >
                            Kontak
                        </button>
                    </nav>

                    {/* Actions */}
                    <div className="flex justify-end items-center space-x-4 w-full">
                        <Link to="/login" className="px-4 py-2 text-md font-medium text-utama bg-utama-hover hover:text-white rounded-md">
                            Masuk
                        </Link>
                        <Link
                            to="/register"
                            className="bg-utama text-white px-4 py-2 rounded-md text-md font-medium hover:bg-blue-700 transition"
                        >
                            Daftar
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
