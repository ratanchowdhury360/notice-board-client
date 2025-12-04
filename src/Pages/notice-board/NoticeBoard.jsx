import React, { useState } from 'react';
import { Link } from 'react-router';

const NoticeBoard = () => {
    // Fake data for notices
    const [notices, setNotices] = useState([
        {
            id: 1,
            title: "Office closed on Friday for maintenance.",
            noticeType: "General / Company-W",
            department: "All Department",
            departmentColor: "blue", // blue link
            publishedOn: "15-Jun-2025",
            status: "Published",
            isPublished: true
        },
        {
            id: 2,
            title: "Eid al-Fitr holiday schedule.",
            noticeType: "Holiday & Event",
            department: "Finance",
            departmentColor: "blue", // blue link
            publishedOn: "15-Jun-2025",
            status: "Published",
            isPublished: true
        },
        {
            id: 3,
            title: "Updated code of conduct policy",
            noticeType: "HR & Policy Update",
            department: "Sales Team",
            departmentColor: "orange", // orange link
            publishedOn: "15-Jun-2025",
            status: "Published",
            isPublished: true
        },
        {
            id: 4,
            title: "Payroll for October will be processed on 28th",
            noticeType: "Finance & Payroll",
            department: "Web Team",
            departmentColor: "blue", // blue link
            publishedOn: "15-Jun-2025",
            status: "Published",
            isPublished: true
        },
        {
            id: 5,
            title: "System update scheduled for 30 Oct (9:00-11:00 PM)",
            noticeType: "IT / System Maintena",
            department: "Database Team",
            departmentColor: "blue", // blue link (no link shown in image but default blue)
            publishedOn: "15-Jun-2025",
            status: "Published",
            isPublished: true
        },
        {
            id: 6,
            title: "Design team sprint review moved to Tuesday.",
            noticeType: "Department / Team",
            department: "Admin",
            departmentColor: "blue", // blue link
            publishedOn: "15-Jun-2025",
            status: "Published",
            isPublished: true
        },
        {
            id: 7,
            title: "Unauthorized absence recorded on 18 Oct 2025",
            noticeType: "Warning / Disciplinary",
            department: "Individual",
            departmentColor: "blue", // blue link
            publishedOn: "15-Jun-2025",
            status: "Unpublished",
            isPublished: false
        },
        {
            id: 8,
            title: "Office closed today due to severe weather",
            noticeType: "Emergency / Urgent",
            department: "HR",
            departmentColor: "red", // red text
            publishedOn: "15-Jun-2025",
            status: "Draft",
            isPublished: false
        }
    ]);

    const [filters, setFilters] = useState({
        department: '',
        employeeId: '',
        status: '',
        publishedOn: ''
    });

    const activeNotices = notices.filter(n => n.status === 'Published').length;
    const draftNotices = notices.filter(n => n.status === 'Draft').length;

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            department: '',
            employeeId: '',
            status: '',
            publishedOn: ''
        });
    };

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
        setNotices(prevNotices => 
            prevNotices.map(notice => {
                if (notice.id === noticeId) {
                    let newStatus = currentStatus;
                    let newIsPublished = !currentIsPublished;

                    // Handle status changes based on toggle
                    if (currentStatus === 'Published' && !newIsPublished) {
                        // Published -> Unpublished
                        newStatus = 'Unpublished';
                    } else if (currentStatus === 'Unpublished' && newIsPublished) {
                        // Unpublished -> Published
                        newStatus = 'Published';
                    } else if (currentStatus === 'Draft' && newIsPublished) {
                        // Draft -> Published
                        newStatus = 'Published';
                    } else if (currentStatus === 'Draft' && !newIsPublished) {
                        // Draft stays as Draft when toggled off (can't unpublish a draft)
                        newStatus = 'Draft';
                        newIsPublished = false;
                    }

                    return {
                        ...notice,
                        status: newStatus,
                        isPublished: newIsPublished
                    };
                }
                return notice;
            })
        );
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

    return (
        <div className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    {/* Title */}
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">Notice Management</h1>

                    {/* Summary */}
                    <div className="mb-6">
                        <span className="text-green-600 font-semibold mr-4">Active Notices: {activeNotices}</span>
                        <span className="text-orange-600 font-semibold">Draft Notice: {String(draftNotices).padStart(2, '0')}</span>
                    </div>


                </div>
                <div>
                    {/* Action Buttons */}
                    <div className="flex gap-4 mb-6">
                        <Link to="/notice-board/create" className="btn bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-md">
                            + Create Notice
                        </Link>
                        <button className="btn bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 shadow-sm">
                            <span className="mr-2">✏️</span> All Draft Notice
                        </button>
                    </div>
                </div>
            </div>


            {/* Filters */}
            <div className="bg-gray-50 p-4 flex justify-between rounded-lg mb-6 border border-gray-200">
                <div className="flex flex-wrap j gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-700">Filter by:</label>
                        <select
                            className="select select-bordered w-48 bg-white border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-400"
                            value={filters.department}
                            onChange={(e) => handleFilterChange('department', e.target.value)}
                        >
                            <option value="" className="text-gray-400">Departments or individuals</option>
                            <option value="all">All Department</option>
                            <option value="finance">Finance</option>
                            <option value="hr">HR</option>
                            <option value="sales">Sales Team</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Employee Id or Name"
                            className="input input-bordered w-48 bg-white border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800 placeholder:text-gray-400"
                            value={filters.employeeId}
                            onChange={(e) => handleFilterChange('employeeId', e.target.value)}
                        />
                    </div>
                    <div>
                        <select
                            className="select select-bordered w-32 bg-white border-gray-300 focus:border-blue-500 focus:outline-none text-gray-800"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="" className="text-gray-400">Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="unpublished">Unpublished</option>
                        </select>
                    </div>
                    <div>
                        <input
                            type="date"
                            className="input input-bordered w-40 bg-white border-gray-300 focus:border-blue-500 text-gray-800 placeholder:text-gray-400
                            [&::-webkit-calendar-picker-indicator]:invert
                            [&::-webkit-calendar-picker-indicator]:opacity-60
                            hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
                            value={filters.publishedOn}
                            onChange={(e) => handleFilterChange('publishedOn', e.target.value)}
                        />
                    </div>
                    <button
                        onClick={resetFilters}
                        className="btn bg-blue-600 hover:bg-blue-700 text-white border-0 btn-sm shadow-sm h-10"
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="table w-full">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="text-gray-700 font-semibold py-3">
                                <input type="checkbox" className="checkbox checkbox-primary  checkbox-sm" />
                            </th>
                            <th className="text-gray-700 font-semibold py-3">Title</th>
                            <th className="text-gray-700 font-semibold py-3">Notice Type</th>
                            <th className="text-gray-700 font-semibold py-3">Departments/Individual</th>
                            <th className="text-gray-700 font-semibold py-3">Published On</th>
                            <th className="text-gray-700 font-semibold py-3">Status</th>
                            <th className="text-gray-700 font-semibold py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {notices.map((notice) => (
                            <tr key={notice.id} className="hover:bg-gray-50 border-b border-gray-100">
                                <td className="py-3">
                                    <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                                </td>
                                <td className="font-medium text-gray-800 py-3">{notice.title}</td>
                                <td className="text-gray-700 py-3">{notice.noticeType}</td>
                                <td className="py-3">
                                    <span className={getDepartmentColorClass(notice.departmentColor)}>
                                        {notice.department}
                                    </span>
                                </td>
                                <td className="text-gray-700 py-3">{notice.publishedOn}</td>
                                <td className="py-3">
                                    <div className="flex items-center gap-2">
                                        <span className={`${getStatusBadgeClass(notice.status)} px-3 py-1 rounded-full text-xs font-medium`}>
                                            {notice.status}
                                        </span>
                                        <input
                                            type="checkbox"
                                            className={`toggle toggle-sm cursor-pointer ${
                                                notice.isPublished 
                                                    ? 'toggle-success checked:bg-green-500' 
                                                    : 'bg-gray-300'
                                            }`}
                                            checked={notice.isPublished}
                                            onChange={() => handleToggleStatus(notice.id, notice.status, notice.isPublished)}
                                        />
                                    </div>
                                </td>
                                
                                <td className="py-3">
                                    <div className="flex gap-2">
                                        <button className="btn btn-sm btn-ghost hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-0 min-h-0 h-8 w-8 p-0">👁️</button>
                                        <button className="btn btn-sm btn-ghost hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-0 min-h-0 h-8 w-8 p-0">✏️</button>
                                        <button className="btn btn-sm btn-ghost hover:bg-gray-100 text-gray-600 hover:text-gray-800 border-0 min-h-0 h-8 w-8 p-0">⋯</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center mt-6">
                <div className="join shadow-md">

                    {/* Prev */}
                    <button className="join-item btn btn-sm bg-white text-gray-600 border border-gray-300 hover:bg-gray-100">
                        «
                    </button>

                    {/* Pages */}
                    <button className="join-item btn btn-sm bg-blue-600 text-white border-blue-600 hover:bg-blue-700">
                        1
                    </button>
                    <button className="join-item btn btn-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
                        2
                    </button>
                    <button className="join-item btn btn-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
                        3
                    </button>
                    <button className="join-item btn btn-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
                        4
                    </button>
                    <button className="join-item btn btn-sm bg-white text-gray-700 border border-gray-300 hover:bg-gray-100">
                        5
                    </button>

                    {/* Next */}
                    <button className="join-item btn btn-sm bg-white text-gray-600 border border-gray-300 hover:bg-gray-100">
                        »
                    </button>
                </div>
            </div>

        </div>
    );
};

export default NoticeBoard;

