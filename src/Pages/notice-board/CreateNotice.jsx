import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';

const CreateNotice = () => {
    const navigate = useNavigate();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [formData, setFormData] = useState({
        targetType: 'Individual',
        noticeTitle: '',
        employeeId: '',
        employeeName: '',
        position: '',
        departments: [],
        noticeType: '',
        publishDate: '',
        noticeBody: '',
        attachments: []
    });

    const availableDepartments = [
        'All Department',
        'Finance',
        'HR',
        'Sales Team',
        'Web Team',
        'Database Team',
        'Admin',
        'IT'
    ];

    const noticeTypes = [
        'Warning / Disciplinary',
        'Performance Improvement',
        'Appreciation / Recognition',
        'Attendance / Leave Issue',
        'Payroll / Compensation',
        'Contract / Role Update',
        'Advisory / Personal Reminder'
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const removeFile = (index) => {
        setFormData(prev => ({
            ...prev,
            attachments: prev.attachments.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e, action) => {
        e.preventDefault();
        if (action === 'publish') {
            setShowSuccessModal(true);
        } else if (action === 'draft') {
            // Save as draft logic
            navigate('/notice-board');
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        navigate('/notice-board');
    };

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <Link to="/notice-board" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2">
                    <span className="text-xl">←</span>
                    <span className="text-xl font-bold text-gray-800">Create a Notice</span>
                </Link>
                <p className="text-gray-600 ml-8">Please fill in the details below</p>
            </div>

            {/* Form */}
            <form onSubmit={(e) => handleSubmit(e, 'publish')} className="max-w-4xl">
                {/* Target Type */}
                <div className="mb-6">
                    <label className="label">
                        <span className="label-text text-gray-800 font-semibold">Target Department(s) or Individual <span className="text-red-500">*</span></span>
                    </label>
                    <select
                        className={`select select-bordered w-full text-gray-800 border-gray-300 focus:border-blue-500 ${
                            formData.targetType === 'Individual' ? 'bg-blue-50' : 'bg-white'
                        }`}
                        value={formData.targetType}
                        onChange={(e) => handleInputChange('targetType', e.target.value)}
                        required
                    >
                        <option value="Individual">Individual</option>
                        <option value="Department">Department</option>
                    </select>
                </div>

                {/* Department Selection (if Department type) */}
                {formData.targetType === 'Department' && (
                    <div className="mb-6">
                        <label className="label">
                            <span className="label-text text-gray-800 font-semibold">Select Department(s) <span className="text-red-500">*</span></span>
                        </label>
                        <select
                            className="select select-bordered w-full text-gray-800 bg-white border-gray-300 focus:border-blue-500"
                            onChange={(e) => {
                                if (e.target.value && !formData.departments.includes(e.target.value)) {
                                    handleInputChange('departments', [...formData.departments, e.target.value]);
                                    e.target.value = '';
                                }
                            }}
                        >
                            <option value="" className="text-gray-400">Select Department</option>
                            {availableDepartments.map((dept) => (
                                <option key={dept} value={dept}>{dept}</option>
                            ))}
                        </select>
                        {formData.departments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.departments.map((dept, index) => (
                                    <span key={index} className="badge badge-lg gap-2">
                                        {dept}
                                        <button
                                            type="button"
                                            onClick={() => {
                                                handleInputChange('departments', formData.departments.filter((_, i) => i !== index));
                                            }}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Notice Title */}
                <div className="mb-6">
                    <label className="label">
                        <span className="label-text text-gray-800 font-semibold">Notice Title <span className="text-red-500">*</span></span>
                    </label>
                    <input
                        type="text"
                        placeholder="Write the Title of Notice"
                        className="input input-bordered w-full text-gray-800 placeholder:text-gray-400 bg-white border-gray-300 focus:border-blue-500"
                        value={formData.noticeTitle}
                        onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
                        required
                    />
                </div>

                {/* Employee Details (if Individual) */}
                {formData.targetType === 'Individual' && (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="label">
                                    <span className="label-text text-gray-800 font-semibold">Select Employee ID <span className="text-red-500">*</span></span>
                                </label>
                                <select
                                    className="select select-bordered w-full text-gray-800 bg-white border-gray-300 focus:border-blue-500"
                                    value={formData.employeeId}
                                    onChange={(e) => handleInputChange('employeeId', e.target.value)}
                                    required
                                >
                                    <option value="" className="text-gray-400">Select employee designation</option>
                                    <option value="EMP001">EMP001</option>
                                    <option value="EMP002">EMP002</option>
                                </select>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text text-gray-800 font-semibold">Employee Name <span className="text-red-500">*</span></span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter employee full name"
                                    className="input input-bordered w-full text-gray-800 placeholder:text-gray-400 bg-white border-gray-300 focus:border-blue-500"
                                    value={formData.employeeName}
                                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
                                    required
                                />
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text text-gray-800 font-semibold">Position <span className="text-red-500">*</span></span>
                                </label>
                                <select
                                    className="select select-bordered w-full text-gray-800 bg-white border-gray-300 focus:border-blue-500"
                                    value={formData.position}
                                    onChange={(e) => handleInputChange('position', e.target.value)}
                                    required
                                >
                                    <option value="" className="text-gray-400">Select employee department</option>
                                    <option value="HR">HR</option>
                                    <option value="Finance">Finance</option>
                                    <option value="IT">IT</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {/* Notice Type & Publish Date (Two Columns) */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label className="label">
                            <span className="label-text text-gray-800 font-semibold">Notice Type <span className="text-red-500">*</span></span>
                        </label>
                        <select
                            className="select select-bordered w-full text-gray-800 bg-white border-gray-300 focus:border-blue-500"
                            value={formData.noticeType}
                            onChange={(e) => handleInputChange('noticeType', e.target.value)}
                            required
                        >
                            <option value="" className="text-gray-400">Select Notice Type</option>
                            {noticeTypes.map((type) => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="label">
                            <span className="label-text text-gray-800 font-semibold">Publish Date <span className="text-red-500">*</span></span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full text-gray-800 bg-white border-gray-300 focus:border-blue-500"
                            placeholder="Select Publishing Date"
                            value={formData.publishDate}
                            onChange={(e) => handleInputChange('publishDate', e.target.value)}
                            required
                        />
                    </div>
                </div>

                {/* Notice Body */}
                <div className="mb-6">
                    <label className="label">
                        <span className="label-text text-gray-800 font-semibold">Notice Body</span>
                    </label>
                    <textarea
                        className="textarea textarea-bordered w-full h-32 text-gray-800 placeholder:text-gray-400 bg-white border-gray-300 focus:border-blue-500"
                        placeholder="Write the details about notice"
                        value={formData.noticeBody}
                        onChange={(e) => handleInputChange('noticeBody', e.target.value)}
                    ></textarea>
                </div>

                {/* File Upload */}
                <div className="mb-6">
                    <label className="label">
                        <span className="label-text text-gray-800 font-semibold">Upload Attachments (optional)</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                        <input
                            type="file"
                            id="file-upload"
                            className="hidden"
                            accept=".jpg,.png,.pdf"
                            onChange={handleFileUpload}
                            multiple
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="text-4xl mb-2 text-green-500">☁️</div>
                            <p className="text-green-600 font-medium">Upload nominee profile image or drag and drop.</p>
                            <p className="text-sm text-gray-500 mt-2">Accepted File Type: jpg, png</p>
                        </label>
                    </div>
                    {formData.attachments.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {formData.attachments.map((file, index) => (
                                <div key={index} className="badge badge-lg gap-2 bg-gray-200 text-gray-700 px-3 py-2">
                                    {file.name}
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-500 hover:text-red-700 ml-1"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-4 mt-8">
                    <Link to="/notice-board" className="btn bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 shadow-sm">
                        Cancel
                    </Link>
                    <button
                        type="button"
                        onClick={(e) => handleSubmit(e, 'draft')}
                        className="btn bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-300 shadow-sm"
                    >
                        Save as Draft
                    </button>
                    <button
                        type="submit"
                        className="btn bg-orange-500 hover:bg-orange-600 text-white border-0 shadow-md"
                    >
                        <span className="mr-2">✓</span> Publish Notice
                    </button>
                </div>
            </form>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-white text-4xl">✓</span>
                            </div>
                            <h2 className="text-2xl font-bold mb-4">Notice Published Successfully</h2>
                            <p className="text-gray-600 mb-6">
                                Your notice "{formData.noticeTitle || 'Holiday Schedule - November 2025'}" has been published and is now visible to all selected departments.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => navigate('/notice-board')}
                                    className="btn btn-outline btn-primary"
                                >
                                    View Notice
                                </button>
                                <button
                                    onClick={() => {
                                        setShowSuccessModal(false);
                                        setFormData({
                                            targetType: 'Individual',
                                            noticeTitle: '',
                                            employeeId: '',
                                            employeeName: '',
                                            position: '',
                                            departments: [],
                                            noticeType: '',
                                            publishDate: '',
                                            noticeBody: '',
                                            attachments: []
                                        });
                                    }}
                                    className="btn btn-outline btn-warning"
                                >
                                    + Create Another
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="btn btn-outline"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreateNotice;

