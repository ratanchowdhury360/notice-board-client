import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://notice-board-server-rho.vercel.app';

const NoticeBoard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [notices, setNotices] = useState([]);
    const [selectedNotice, setSelectedNotice] = useState(null);
    const [showViewModal, setShowViewModal] = useState(false);
    // Load saved page from localStorage, default to 1
    const [currentPage, setCurrentPage] = useState(() => {
        const savedPage = localStorage.getItem('noticeBoardPage');
        return savedPage ? parseInt(savedPage, 10) : 1;
    });
    const noticesPerPage = 8;
    // Load saved filters from localStorage
    const [filters, setFilters] = useState(() => {
        const savedFilters = localStorage.getItem('noticeBoardFilters');
        return savedFilters ? JSON.parse(savedFilters) : {
            department: '',
            employeeId: '',
            status: '',
            publishedOn: ''
        };
    });

    // Fetch notices from backend
    const fetchNotices = () => {
        fetch(`${API_BASE_URL}/notice`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                // Sort notices by date/time - most recent first
                const sortedNotices = data.sort((a, b) => {
                    const dateA = new Date(a.publishDate || a.publishedOn || a.createdAt || 0);
                    const dateB = new Date(b.publishDate || b.publishedOn || b.createdAt || 0);
                    return dateB - dateA; // Most recent first
                });
                setNotices(sortedNotices);
            })
            .catch(err => {
                console.error('Error fetching notices:', err);
                console.error('API URL:', API_BASE_URL);
                setNotices([]);
            });
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    // Refresh notices when returning from edit page
    useEffect(() => {
        if (location.state?.refresh) {
            fetchNotices();
            // Restore saved state if available (using setTimeout to avoid setState in effect)
            const savedState = localStorage.getItem('noticeBoardState');
            if (savedState) {
                try {
                    const state = JSON.parse(savedState);
                    if (state.page) {
                        setTimeout(() => {
                            setCurrentPage(state.page);
                            localStorage.setItem('noticeBoardPage', state.page.toString());
                        }, 0);
                    }
                    if (state.filters) {
                        setTimeout(() => {
                            setFilters(state.filters);
                            localStorage.setItem('noticeBoardFilters', JSON.stringify(state.filters));
                        }, 0);
                    }
                } catch (e) {
                    console.error('Error restoring state:', e);
                }
            }
            // Clear the refresh flag
            window.history.replaceState({}, '', location.pathname);
        }
    }, [location.state, location.pathname]);

    // Save current page to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('noticeBoardPage', currentPage.toString());
    }, [currentPage]);

    // Save filters to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem('noticeBoardFilters', JSON.stringify(filters));
    }, [filters]);

    // Cleanup: Ensure modal is closed when component unmounts
    useEffect(() => {
        return () => {
            setShowViewModal(false);
            setSelectedNotice(null);
        };
    }, []);

    // Ensure currentPage is valid when totalPages changes (e.g., after filtering)
    // Note: totalPages is calculated below after filteredNotices

    const activeNotices = notices.filter(n => n.status === 'Published').length;
    const draftNotices = notices.filter(n => n.status === 'Draft').length;

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
        // Reset to first page when filter changes and save it
        setCurrentPage(1);
        localStorage.setItem('noticeBoardPage', '1');
    };

    const resetFilters = () => {
        setFilters({
            department: '',
            employeeId: '',
            status: '',
            publishedOn: ''
        });
        setCurrentPage(1);
        localStorage.setItem('noticeBoardPage', '1');
    };

    // Apply filters to notices
    const filteredNotices = notices.filter(notice => {
        // Filter by department
        if (filters.department && filters.department !== 'all' && filters.department !== '') {
            if (notice.targetType === 'Individual') {
                if (filters.department.toLowerCase() !== 'individual') {
                    return false;
                }
            } else {
                const noticeDept = (notice.departments?.join(', ') || notice.department || '').toLowerCase();
                if (!noticeDept.includes(filters.department.toLowerCase())) {
                    return false;
                }
            }
        }

        // Filter by employee ID or name
        if (filters.employeeId && filters.employeeId.trim() !== '') {
            const searchTerm = filters.employeeId.toLowerCase();
            const empId = (notice.employeeId || '').toLowerCase();
            const empName = (notice.employeeName || '').toLowerCase();
            if (!empId.includes(searchTerm) && !empName.includes(searchTerm)) {
                return false;
            }
        }

        // Filter by status
        if (filters.status && filters.status !== '') {
            const noticeStatus = (notice.status || '').toLowerCase();
            if (noticeStatus !== filters.status.toLowerCase()) {
                return false;
            }
        }

        // Filter by published date
        if (filters.publishedOn && filters.publishedOn !== '') {
            const noticeDate = new Date(notice.publishDate || notice.publishedOn).toISOString().split('T')[0];
            if (noticeDate !== filters.publishedOn) {
                return false;
            }
        }

        return true;
    });

    // Calculate pagination
    const totalPages = Math.max(1, Math.ceil(filteredNotices.length / noticesPerPage));
    
    // Use currentPage directly, clamp to valid range (handles out-of-bounds automatically)
    const pageToUse = Math.min(Math.max(1, currentPage), totalPages);
    
    // Calculate which notices to show - this will update instantly when currentPage changes
    const startIndex = (pageToUse - 1) * noticesPerPage;
    const endIndex = startIndex + noticesPerPage;
    const currentNotices = filteredNotices.slice(startIndex, endIndex);

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'Published':
                return 'text-white bg-green-500';
            case 'Draft':
                return 'text-white bg-orange-500 opacity-70';
            case 'Unpublished':
                return 'text-gray-600 bg-gray-300';
            default:
                return 'text-gray-600 bg-gray-300';
        }
    };

    const handleToggleStatus = (noticeId, currentStatus, currentIsPublished) => {
        // Find the notice - handle both id and _id
        const notice = notices.find(n => (n.id === noticeId) || (n._id === noticeId));
        if (!notice) {
            console.error('Notice not found:', noticeId);
            return;
        }

        // Use the correct ID format (prefer id, fallback to _id)
        const idToUse = notice.id || notice._id || noticeId;
        
        let newStatus = currentStatus;
        let newIsPublished = !currentIsPublished;

        // Handle status changes based on toggle
        if (currentStatus === 'Published' && !newIsPublished) {
            newStatus = 'Unpublished';
        } else if (currentStatus === 'Unpublished' && newIsPublished) {
            newStatus = 'Published';
        } else if (currentStatus === 'Draft' && newIsPublished) {
            newStatus = 'Published';
        } else if (currentStatus === 'Draft' && !newIsPublished) {
            newStatus = 'Draft';
            newIsPublished = false;
        }

        const updatedNotice = {
            ...notice,
            status: newStatus,
            isPublished: newIsPublished
        };

        // send data to the server
        fetch(`${API_BASE_URL}/notice/${idToUse}`, {
            method: 'PUT',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(updatedNotice)
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }
                return res.json();
            })
            .then(data => {
                if (data.message || data.modifiedCount || data.acknowledged) {
                    // Refresh notices from server to get updated data
                    fetchNotices();
                } else {
                    console.error('Failed to update notice:', data);
                }
            })
            .catch(err => {
                console.error('Error updating notice:', err);
                console.error('API URL:', API_BASE_URL);
            });
    };

    const getDepartmentColorClass = (color) => {
        switch (color) {
            case 'blue':
                return 'text-blue-600 hover:underline cursor-pointer';
            case 'orange':
                return 'text-orange-600 hover:underline cursor-pointer';
            case 'red':
                return 'text-red-600 cursor-pointer';
            default:
                return 'text-blue-600 hover:underline cursor-pointer';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    // Handle View Notice Details
    const handleViewNotice = (notice) => {
        if (!notice) {
            console.error('No notice provided to handleViewNotice');
            return;
        }
        // Save current state before opening modal
        const currentState = {
            page: currentPage,
            filters: filters
        };
        localStorage.setItem('noticeBoardState', JSON.stringify(currentState));
        
        setSelectedNotice(notice);
        setShowViewModal(true);
    };

    // Handle Edit Notice
    const handleEditNotice = (notice) => {
        if (!notice) {
            console.error('No notice provided to handleEditNotice');
            return;
        }
        
        const noticeId = notice.id || notice._id;
        if (!noticeId) {
            console.error('Notice does not have an id:', notice);
            alert('Cannot edit notice: Missing notice ID');
            return;
        }
        
        // Save current state before navigating
        const currentState = {
            page: currentPage,
            filters: filters
        };
        localStorage.setItem('noticeBoardState', JSON.stringify(currentState));
        
        // Navigate to edit page with notice data and current state
        navigate(`/notice-board/edit/${noticeId}`, { 
            state: { 
                notice,
                returnState: currentState
            } 
        });
    };

    // Handle Delete Notice
    const handleDeleteNotice = (noticeId) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                // Delete from server
                fetch(`${API_BASE_URL}/notice/${noticeId}`, {
                    method: 'DELETE'
                })
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`HTTP error! status: ${res.status}`);
                        }
                        return res.json();
                    })
                    .then(data => {
                        if (data.message || data.deletedCount) {
                            // Refresh notices from server to get updated data
                            fetchNotices();
                            
                            Swal.fire({
                                title: "Deleted!",
                                text: "Your notice has been deleted.",
                                icon: "success"
                            });
                        }
                    })
                    .catch(err => {
                        console.error('Error deleting notice:', err);
                        console.error('API URL:', API_BASE_URL);
                        Swal.fire({
                            title: "Error!",
                            text: "Failed to delete notice.",
                            icon: "error"
                        });
                    });
            }
        });
    };

    return (
        <div className="p-3 sm:p-6 bg-white h-full">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
                <div>
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-gray-800">Notice Management</h1>

                    {/* Summary */}
                    <div className="mb-6 flex flex-col sm:flex-row gap-2 sm:gap-4 text-sm sm:text-base">
                        <span className="text-green-600 font-semibold">Active Notices: {activeNotices}</span>
                        <span className="text-orange-600 font-semibold">Draft Notice: {String(draftNotices).padStart(2, '0')}</span>
                    </div>


                </div>
                <div>
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-6">
                        <Link to="/notice-board/create" className="btn bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-md btn-sm sm:btn-md">
                            + Create Notice
                        </Link>
                        <button className="btn bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 shadow-sm btn-sm sm:btn-md">
                            <span className="mr-2">✏️</span> <span className="hidden sm:inline">All Draft Notice</span><span className="sm:hidden">Draft</span>
                        </button>
                    </div>
                </div>
            </div>


            {/* Filters */}
            <div className="bg-gray-50 p-3 sm:p-4 rounded-lg mb-6 border border-gray-200">
                <div className="flex flex-col gap-3 sm:gap-4">
                    <label className="block text-xs sm:text-sm font-medium text-gray-700">Filter by:</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3 items-end">
                        <div>
                            <select
                                className="select select-bordered w-full bg-white border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-400 text-sm"
                                value={filters.department}
                                onChange={(e) => handleFilterChange('department', e.target.value)}
                            >
                                <option value="" className="text-gray-400">Departments or individuals</option>
                                <option value="all">All Department</option>
                                <option value="finance">Finance</option>
                                <option value="hr">HR</option>
                                <option value="sales team">Sales Team</option>
                                <option value="web team">Web Team</option>
                                <option value="database team">Database Team</option>
                                <option value="admin">Admin</option>
                                <option value="it">IT</option>
                                <option value="individual">Individual</option>
                            </select>
                        </div>
                        <div>
                            <input
                                type="text"
                                placeholder="Employee Id or Name"
                                className="input input-bordered w-full bg-white border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-400 text-sm"
                                value={filters.employeeId}
                                onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                            />
                        </div>
                        <div>
                            <select
                                className="select select-bordered w-full bg-white border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800 text-sm"
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="" className="text-gray-400">Status</option>
                                <option value="Published">Published</option>
                                <option value="Draft">Draft</option>
                                <option value="Unpublished">Unpublished</option>
                            </select>
                        </div>
                        <div>
                            <input
                                type="date"
                                className="input input-bordered w-full bg-white border-gray-300 focus:border-blue-500 text-gray-800 placeholder:text-gray-400 text-sm
                                [&::-webkit-calendar-picker-indicator]:invert
                                [&::-webkit-calendar-picker-indicator]:opacity-60
                                hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                                value={filters.publishedOn}
                                onChange={(e) => handleFilterChange('publishedOn', e.target.value)}
                            />
                        </div>
                        <button
                            onClick={resetFilters}
                            className="btn bg-blue-600 hover:bg-blue-700 text-white border-0 btn-sm shadow-sm w-full"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="table w-full text-xs sm:text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3">
                                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                            </th>
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3">Title</th>
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3 hidden sm:table-cell">Type</th>
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3 hidden md:table-cell">Dept/Ind</th>
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3 hidden lg:table-cell">Published</th>
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3">Status</th>
                            <th className="text-gray-700 font-semibold py-2 sm:py-3 px-1 sm:px-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentNotices.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-8 text-gray-500">
                                    No notices found
                                </td>
                            </tr>
                        ) : (
                            currentNotices.map((notice) => {
                                const noticeId = notice.id || notice._id;
                                const isDraft = notice.status === 'Draft';
                                
                                return (
                                <tr 
                                    key={noticeId} 
                                    className="hover:bg-gray-50 border-b border-gray-100"
                                    onClick={(e) => {
                                        // If Draft, make row clickable to edit (but not if clicking on buttons/inputs)
                                        if (isDraft && !e.target.closest('button') && !e.target.closest('input') && !e.target.closest('a')) {
                                            handleEditNotice(notice);
                                        }
                                    }}
                                    style={isDraft ? { cursor: 'pointer' } : {}}
                                >
                                    <td className="py-3">
                                        <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                                    </td>
                                    <td className="font-medium text-gray-800 py-3">{notice.noticeTitle || notice.title}</td>
                                    <td className="text-gray-700 py-3">{notice.noticeType}</td>
                                    <td className="py-3">
                                        <span className={getDepartmentColorClass(notice.departmentColor || 'blue')}>
                                            {notice.targetType === 'Individual' 
                                                ? (notice.employeeName || 'Individual')
                                                : (notice.departments?.join(', ') || notice.department || 'N/A')
                                            }
                                        </span>
                                    </td>
                                    <td className="text-gray-700 py-3">{formatDate(notice.publishDate || notice.publishedOn)}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className={`${getStatusBadgeClass(notice.status)} px-3 py-1 rounded-full text-xs font-medium ${isDraft ? 'cursor-pointer hover:opacity-80' : ''}`}
                                                onClick={(e) => {
                                                    if (isDraft) {
                                                        e.stopPropagation();
                                                        handleEditNotice(notice);
                                                    }
                                                }}
                                                title={isDraft ? 'Click to edit draft' : ''}
                                            >
                                                {notice.status}
                                            </span>
                                            <input
                                                type="checkbox"
                                                className={`toggle toggle-sm cursor-pointer ${
                                                    notice.isPublished 
                                                        ? 'toggle-success checked:bg-green-500' 
                                                        : 'bg-gray-300'
                                                }`}
                                                checked={notice.isPublished || false}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleStatus(noticeId, notice.status, notice.isPublished);
                                                }}
                                            />
                                        </div>
                                    </td>
                                    
                                    <td className="py-3">
                                        <div className="flex gap-2 items-center">
                                            {!isDraft && (
                                                <button 
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        handleViewNotice(notice);
                                                    }}
                                                    className="btn btn-sm btn-ghost hover:bg-blue-100 text-blue-600 hover:text-blue-800 border-0 h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
                                                    title="View Details"
                                                >
                                                    <span className="text-lg" role="img" aria-label="View">👁️</span>
                                                </button>
                                            )}
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleEditNotice(notice);
                                                }}
                                                className="btn btn-sm btn-ghost hover:bg-green-100 text-green-600 hover:text-green-800 border-0 h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
                                                title={isDraft ? "Edit & Publish Draft" : "Edit Notice"}
                                            >
                                                <span className="text-lg" role="img" aria-label="Edit">✏️</span>
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleDeleteNotice(noticeId);
                                                }}
                                                className="btn btn-sm btn-ghost hover:bg-red-100 text-red-600 hover:text-red-800 border-0 h-9 w-9 p-0 flex items-center justify-center cursor-pointer"
                                                title="Delete Notice"
                                            >
                                                <span className="text-lg" role="img" aria-label="Delete">⋯</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {filteredNotices.length > 0 && (
                <div className="flex justify-center items-center mt-6 mb-4">
                    <div className="join shadow-md">
                        {/* Prev */}
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={pageToUse === 1}
                            className="join-item btn btn-sm bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            «
                        </button>

                        {/* Pages */}
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={`page-${page}`}
                                type="button"
                                onClick={() => setCurrentPage(page)}
                                className={`join-item btn btn-sm border ${
                                    pageToUse === page
                                        ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                {page}
                            </button>
                        ))}

                        {/* Next */}
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={pageToUse === totalPages}
                            className="join-item btn btn-sm bg-white text-gray-600 border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            »
                        </button>
                    </div>
                </div>
            )}

            {/* View Notice Details Modal */}
            {showViewModal && selectedNotice && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => {
                        // Close modal when clicking on backdrop
                        if (e.target === e.currentTarget) {
                            setShowViewModal(false);
                            setSelectedNotice(null);
                        }
                    }}
                >
                    <div 
                        className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Notice Details</h2>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedNotice(null);
                                }}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Notice Title */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Notice Title</label>
                                <p className="text-lg text-gray-800 mt-1">
                                    {String(selectedNotice.noticeTitle || selectedNotice.title || 'Not provided')}
                                </p>
                            </div>

                            {/* Target Type */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Target Type</label>
                                <p className="text-gray-800 mt-1">{String(selectedNotice.targetType || 'Not specified')}</p>
                            </div>

                            {/* Department or Individual Details */}
                            {selectedNotice.targetType === 'Individual' ? (
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Employee ID</label>
                                        <p className="text-gray-800 mt-1">{String(selectedNotice.employeeId || 'Not provided')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Employee Name</label>
                                        <p className="text-gray-800 mt-1">{String(selectedNotice.employeeName || 'Not provided')}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-semibold text-gray-600">Position</label>
                                        <p className="text-gray-800 mt-1">{String(selectedNotice.position || 'Not provided')}</p>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Departments</label>
                                    <p className="text-gray-800 mt-1">
                                        {(() => {
                                            if (selectedNotice.departments) {
                                                if (Array.isArray(selectedNotice.departments)) {
                                                    return selectedNotice.departments.join(', ');
                                                } else if (typeof selectedNotice.departments === 'string') {
                                                    return selectedNotice.departments;
                                                } else {
                                                    // If it's an object, try to convert it
                                                    return 'Not specified';
                                                }
                                            }
                                            return selectedNotice.department || 'Not specified';
                                        })()}
                                    </p>
                                </div>
                            )}

                            {/* Notice Type & Publish Date */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Notice Type</label>
                                    <p className="text-gray-800 mt-1">{String(selectedNotice.noticeType || 'Not specified')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-semibold text-gray-600">Publish Date</label>
                                    <p className="text-gray-800 mt-1">
                                        {selectedNotice.publishDate || selectedNotice.publishedOn 
                                            ? formatDate(selectedNotice.publishDate || selectedNotice.publishedOn)
                                            : 'Not specified'}
                                    </p>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Status</label>
                                <p className="text-gray-800 mt-1">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedNotice.status)}`}>
                                        {String(selectedNotice.status || 'Not specified')}
                                    </span>
                                </p>
                            </div>

                            {/* Notice Body - Always show, even if empty */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Notice Body</label>
                                <p className="text-gray-800 mt-1 whitespace-pre-wrap bg-gray-50 p-4 rounded border min-h-[100px]">
                                    {(() => {
                                        const body = selectedNotice.noticeBody;
                                        if (!body) return 'No content provided';
                                        if (typeof body === 'string') return body;
                                        if (typeof body === 'object') return JSON.stringify(body);
                                        return String(body);
                                    })()}
                                </p>
                            </div>

                            {/* Attachments - Always show section */}
                            <div>
                                <label className="text-sm font-semibold text-gray-600">Attachments</label>
                                {selectedNotice.attachments && selectedNotice.attachments.length > 0 ? (
                                    <div className="mt-4 space-y-4">
                                        {selectedNotice.attachments.map((file, index) => {
                                            let fileName = 'Unknown file';
                                            if (typeof file === 'string') {
                                                fileName = file;
                                            } else if (file && typeof file === 'object') {
                                                fileName = file.name || file.filename || JSON.stringify(file);
                                            }
                                            
                                            const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(fileName);
                                            const isPdf = /\.pdf$/i.test(fileName);
                                            const fileUrl = typeof file === 'string' 
                                                ? (file.startsWith('http://') || file.startsWith('https://') 
                                                    ? file 
                                                    : `${API_BASE_URL}/uploads/${file}`)
                                                : (file.url || (file instanceof File ? URL.createObjectURL(file) : null));

                                            return (
                                                <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                                                    {isImage ? (
                                                        <div className="space-y-2">
                                                            <div className="relative">
                                                                <img 
                                                                    src={fileUrl || '#'} 
                                                                    alt={fileName}
                                                                    className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                                                                    onError={(e) => {
                                                                        e.target.style.display = 'none';
                                                                        const errorDiv = e.target.nextSibling;
                                                                        if (errorDiv) errorDiv.style.display = 'block';
                                                                    }}
                                                                />
                                                                <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                    <span className="text-gray-500">Image not available</span>
                                                                </div>
                                                            </div>
                                                            <p className="text-sm text-gray-600 font-medium">{fileName}</p>
                                                            {fileUrl && (
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white mt-2"
                                                                >
                                                                    👁️ View Full Size
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : isPdf ? (
                                                        <div className="flex items-center gap-3">
                                                            <div className="shrink-0">
                                                                <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center">
                                                                    <span className="text-3xl">📄</span>
                                                                </div>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
                                                                <p className="text-xs text-gray-500">PDF Document</p>
                                                            </div>
                                                            {fileUrl && (
                                                                <a
                                                                    href={fileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                                                                    title="View PDF"
                                                                >
                                                                     View👁️
                                                                </a>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                                <div className="shrink-0">
                                                                    <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                                                                        <span className="text-3xl">📎</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-sm font-medium text-gray-800 truncate">{fileName}</p>
                                                                    <p className="text-xs text-gray-500">File Attachment</p>
                                                                </div>
                                                            </div>
                                                            {fileUrl && (
                                                                <a
                                                                    href={fileUrl}
                                                                    download={fileName}
                                                                    className="btn btn-sm bg-green-500 hover:bg-green-600 text-white"
                                                                    title="Download file"
                                                                >
                                                                    ⬇️ Download
                                                                </a>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 mt-1 italic">No attachments</p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8">
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    setSelectedNotice(null);
                                    // State is already saved, no need to restore
                                }}
                                className="btn bg-gray-100 hover:bg-gray-200 text-gray-700"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    setShowViewModal(false);
                                    handleEditNotice(selectedNotice);
                                }}
                                className="btn bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Edit Notice
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default NoticeBoard;

