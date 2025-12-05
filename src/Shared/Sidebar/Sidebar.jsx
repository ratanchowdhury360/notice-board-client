import React, { useState } from 'react';
import { Link, useLocation } from 'react-router';

const Sidebar = () => {
    const location = useLocation();
    const [expandedItems, setExpandedItems] = useState({
        employee: true, // Expanded by default as shown in design
        careerDatabase: false
    });

    const toggleExpand = (item) => {
        setExpandedItems(prev => ({
            ...prev,
            [item]: !prev[item]
        }));
    };

    const menuItems = [
        { name: 'Dashboard', path: '/', icon: '📊' },
        {
            name: 'Employee',
            icon: '👥',
            hasSubmenu: true,
            submenu: [
                { name: 'Employee Database', path: '/employee/database' },
                { name: 'Add New Employee', path: '/employee/add' },
                { name: 'Performance Report', path: '/employee/performance-report' },
                { name: 'Performance History', path: '/employee/performance-history' }
            ]
        },
        { name: 'Payroll', path: '/payroll', icon: '💰' },
        { name: 'Pay Slip', path: '/pay-slip', icon: '📄' },
        { name: 'Attendance', path: '/attendance', icon: '⏰' },
        { name: 'Request Center', path: '/request-center', icon: '📋' },
        {
            name: 'Career Database',
            icon: '💼',
            hasSubmenu: true,
            submenu: []
        },
        { name: 'Document manager', path: '/document-manager', icon: '📁' },
        { name: 'Notice Board', path: '/notice-board', icon: '📢' },
        { name: 'Activity Log', path: '/activity-log', icon: '📝' },
        { name: 'Profile', path: '/profile', icon: '👤' }
    ];

    return (
        <div className="bg-gray-100 h-screen p-3 sm:p-4 overflow-y-auto">
            {/* Logo */}
            <div className="mb-6 pt-2 sm:pt-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">Nebs-IT</h2>
            </div>

            {/* Menu Items */}
            <ul className="space-y-1">
                {menuItems.map((item) => (
                    <li key={item.name}>
                        {item.hasSubmenu ? (
                            <div>
                                <button
                                    onClick={() => toggleExpand(item.name.toLowerCase().replace(' ', ''))}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                        location.pathname.startsWith(`/${item.name.toLowerCase().replace(' ', '-')}`)
                                            ? 'bg-purple-50 text-purple-700'
                                            : 'text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    <span>{item.icon}</span>
                                    <span className="flex-1 text-left">{item.name}</span>
                                    <span className="text-xs">{expandedItems[item.name.toLowerCase().replace(' ', '')] ? '▼' : '▶'}</span>
                                </button>
                                {expandedItems[item.name.toLowerCase().replace(' ', '')] && item.submenu && (
                                    <ul className="ml-8 mt-1 space-y-1">
                                        {item.submenu.map((subItem) => (
                                            <li key={subItem.name}>
                                                <Link
                                                    to={subItem.path}
                                                    className="block px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded"
                                                >
                                                    {subItem.name}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={item.path}
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                                    location.pathname === item.path || (item.path === '/notice-board' && location.pathname.startsWith('/notice-board'))
                                        ? 'bg-purple-50 text-purple-700'
                                        : 'text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {(location.pathname === item.path || (item.path === '/notice-board' && location.pathname.startsWith('/notice-board'))) && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-600 rounded-r"></div>
                                )}
                                <span>{item.icon}</span>
                                <span>{item.name}</span>
                            </Link>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;