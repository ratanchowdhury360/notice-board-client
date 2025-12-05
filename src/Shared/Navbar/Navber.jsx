import React from 'react';

export const Navber = ({ sidebarOpen, setSidebarOpen }) => {
    const currentDate = new Date().toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    const currentTime = new Date().getHours();
    let greeting = 'Good Morning';
    if (currentTime >= 12 && currentTime < 17) {
        greeting = 'Good Afternoon';
    } else if (currentTime >= 17) {
        greeting = 'Good evening';
    }

    return (
        <div className="bg-blue-800 text-white">
            <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                {/* Left side - Hamburger and Title */}
                <div className="flex items-center gap-3 sm:gap-4">
                    {/* Hamburger Menu - Mobile only */}
                    <button 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="md:hidden p-2 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h2 className="text-lg sm:text-xl font-bold">Notice Board</h2>
                </div>

                {/* Right side - User info and actions */}
                <div className="flex items-center gap-2 sm:gap-6">
                    {/* Greeting and Date - Hidden on small mobile */}
                    <div className="hidden sm:block text-right">
                        <p className="text-xs sm:text-sm font-medium">{greeting} Asif</p>
                        <p className="text-xs text-blue-200">{currentDate}</p>
                    </div>

                    {/* Notification Bell */}
                    <button className="btn btn-circle btn-sm bg-blue-700 hover:bg-blue-600 border-0 text-white p-2">
                        🔔
                    </button>

                    {/* User Profile - Responsive */}
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* User Info - Hidden on small mobile */}
                        <div className="hidden sm:block text-right">
                            <p className="text-xs sm:text-sm font-semibold">Asif Riaj</p>
                            <p className="text-xs text-blue-200">Hr</p>
                        </div>

                        {/* Avatar */}
                        <div className="avatar">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400">
                                <span className="text-white text-xs sm:text-sm font-semibold">AR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navber;