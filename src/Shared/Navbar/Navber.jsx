import React from 'react';

export const Navber = () => {
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
        greeting = 'Good Evening';
    }

    return (
        <div className="bg-blue-800 text-white">
            <div className="flex items-center justify-between px-6 py-4">
                <h2 className="text-xl font-bold">Notice Board</h2>
                <div className="flex items-center gap-6">
                    <div className="text-right">
                        <p className="text-sm font-medium">{greeting} Asif</p>
                        <p className="text-xs text-blue-200">{currentDate}</p>
                    </div>
                    <button className="btn btn-circle btn-sm bg-blue-700 hover:bg-blue-600 border-0 text-white">
                        🔔
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="text-sm font-semibold">Asif Riaj</p>
                            <p className="text-xs text-blue-200">Hr</p>
                        </div>
                        <div className="avatar">
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center border-2 border-blue-400">
                                <span className="text-white text-sm font-semibold">AR</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navber;