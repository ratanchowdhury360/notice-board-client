import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router';

const API_BASE_URL = 'http://localhost:3000';

const EditNotice = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const location = useLocation();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [filePreviewUrls, setFilePreviewUrls] = useState({});
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

    // Load notice data on component mount
    useEffect(() => {
        const loadNoticeData = (notice) => {
            // Handle departments - convert string to array if needed
            let departmentsArray = [];
            if (notice.departments) {
                if (Array.isArray(notice.departments)) {
                    departmentsArray = notice.departments;
                } else if (typeof notice.departments === 'string') {
                    departmentsArray = notice.departments.split(',').map(d => d.trim()).filter(d => d);
                }
            } else if (notice.department && notice.targetType === 'Department') {
                departmentsArray = notice.department.split(',').map(d => d.trim()).filter(d => d);
            }

            // Format date for date input (YYYY-MM-DD format)
            let formattedDate = '';
            if (notice.publishDate) {
                formattedDate = notice.publishDate;
            } else if (notice.publishedOn) {
                formattedDate = notice.publishedOn;
            }
            
            // If date is in a different format, convert it
            if (formattedDate && !formattedDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
                try {
                    const date = new Date(formattedDate);
                    formattedDate = date.toISOString().split('T')[0];
                } catch (err) {
                    console.error('Error parsing date:', err);
                    formattedDate = '';
                }
            }

            setFormData({
                targetType: notice.targetType || 'Individual',
                noticeTitle: notice.noticeTitle || notice.title || '',
                employeeId: notice.employeeId || '',
                employeeName: notice.employeeName || '',
                position: notice.position || '',
                departments: departmentsArray,
                noticeType: notice.noticeType || '',
                publishDate: formattedDate,
                noticeBody: notice.noticeBody || '',
                attachments: notice.attachments || []
            });
        };

        // Try to get notice from location state first (faster)
        if (location.state?.notice) {
            loadNoticeData(location.state.notice);
        } else {
            // Fetch from API if not in state
            fetch(`${API_BASE_URL}/notice/${id}`)
                .then(res => res.json())
                .then(data => {
                    loadNoticeData(data);
                });
        }
    }, [id, location.state]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newUrls = {};
        files.forEach(file => {
            if (file instanceof File) {
                newUrls[file.name + file.size] = URL.createObjectURL(file);
            }
        });
        setFilePreviewUrls(prev => ({ ...prev, ...newUrls }));
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    const removeFile = (index) => {
        setFormData(prev => {
            const fileToRemove = prev.attachments[index];
            if (fileToRemove instanceof File) {
                const key = fileToRemove.name + fileToRemove.size;
                const url = filePreviewUrls[key];
                if (url) {
                    URL.revokeObjectURL(url);
                    setFilePreviewUrls(prevUrls => {
                        const newUrls = { ...prevUrls };
                        delete newUrls[key];
                        return newUrls;
                    });
                }
            }
            return {
                ...prev,
                attachments: prev.attachments.filter((_, i) => i !== index)
            };
        });
    };

    const isImageFile = (file) => {
        if (typeof file === 'string') {
            return /\.(jpg|jpeg|png|gif|webp)$/i.test(file);
        }
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        return imageTypes.includes(file.type) || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
    };

    const isPdfFile = (file) => {
        if (typeof file === 'string') return /\.pdf$/i.test(file);
        return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    };

    const getFilePreviewUrl = (file) => {
        if (typeof file === 'string') {
            // If it's a string (existing file from server), return null or construct URL if needed
            return null;
        }
        if (file instanceof File) {
            const key = file.name + file.size;
            return filePreviewUrls[key] || null;
        }
        return null;
    };

    const getFileUrl = (file) => {
        // For existing files from server (strings), construct URL
        if (typeof file === 'string') {
            // If it's a URL, return as is, otherwise construct from API
            if (file.startsWith('http://') || file.startsWith('https://')) {
                return file;
            }
            return `${API_BASE_URL}/uploads/${file}`;
        }
        // Only create object URL if it's a File or Blob
        if (file instanceof File || file instanceof Blob) {
            return URL.createObjectURL(file);
        }
        // If it's an object with a url property, use that
        if (file && typeof file === 'object' && file.url) {
            return file.url;
        }
        // If it's an object with a name but no File/Blob, return null
        return null;
    };

    const handleSubmit = (e, action) => {
        e.preventDefault();

        if (action === 'draft') {
            // Save as draft - include all fields and preserve ID
            const draftData = {
                ...formData,
                id: parseInt(id),
                status: 'Draft',
                isPublished: false,
                publishedOn: formData.publishDate || new Date().toISOString().split('T')[0],
                department: formData.targetType === 'Department' 
                    ? (formData.departments.length > 0 ? formData.departments.join(', ') : 'All Department')
                    : 'Individual',
                departmentColor: 'blue'
            };

            // update notice data to the database (via server)
            fetch(`${API_BASE_URL}/notice/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(draftData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message) {
                        alert('Draft updated successfully');
                        navigate('/notice-board', { state: { refresh: true } });
                    }
                })
                .catch(err => {
                    console.error('Error updating draft:', err);
                    alert('Failed to update draft');
                });
        } else if (action === 'publish') {
            // Publish notice - include all fields and preserve ID
            const noticeData = {
                ...formData,
                id: parseInt(id),
                status: 'Published',
                isPublished: true,
                publishedOn: formData.publishDate || new Date().toISOString().split('T')[0],
                department: formData.targetType === 'Department' 
                    ? (formData.departments.length > 0 ? formData.departments.join(', ') : 'All Department')
                    : 'Individual',
                departmentColor: 'blue'
            };

            // update notice data to the database (via server)
            fetch(`${API_BASE_URL}/notice/${id}`, {
                method: 'PUT',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(noticeData)
            })
                .then(res => res.json())
                .then(data => {
                    if (data.message) {
                        setShowSuccessModal(true);
                    }
                })
                .catch(err => {
                    console.error('Error updating notice:', err);
                    alert('Failed to update notice');
                });
        }
    };

    const handleCloseModal = () => {
        setShowSuccessModal(false);
        // Navigate back with refresh flag and restore state
        const savedState = localStorage.getItem('noticeBoardState');
        navigate('/notice-board', { 
            state: { 
                refresh: true,
                restoreState: savedState ? JSON.parse(savedState) : null
            } 
        });
    };

    // Cleanup object URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            Object.values(filePreviewUrls).forEach(url => {
                URL.revokeObjectURL(url);
            });
        };
    }, [filePreviewUrls]);

    return (
        <div className="p-6 bg-white min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <Link to="/notice-board" className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-2">
                    <span className="text-xl">←</span>
                    <span className="text-xl font-bold text-gray-800">Edit Notice</span>
                </Link>
                <p className="text-gray-600 ml-8">Update the notice details below</p>
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
                            accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.doc,.docx,.txt,.xls,.xlsx"
                            onChange={handleFileUpload}
                            multiple
                        />
                        <label htmlFor="file-upload" className="cursor-pointer">
                            <div className="text-4xl mb-2 text-green-500">☁️</div>
                            <p className="text-green-600 font-medium">Upload files or drag and drop.</p>
                            <p className="text-sm text-gray-500 mt-2">Accepted File Types: jpg, png, pdf, and other files</p>
                        </label>
                    </div>
                    {formData.attachments.length > 0 && (
                        <div className="mt-4 space-y-4">
                            {formData.attachments.map((file, index) => {
                                const fileName = typeof file === 'string' ? file : file.name;
                                const isImage = isImageFile(file);
                                const isPdf = isPdfFile(file);
                                const previewUrl = getFilePreviewUrl(file);
                                const fileUrl = getFileUrl(file);

                                return (
                                    <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                                        {isImage ? (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    <img 
                                                        src={previewUrl || fileUrl || '#'} 
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
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg"
                                                        title="Remove file"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium">{fileName}</p>
                                            </div>
                                        ) : isPdf ? (
                                            <div className="space-y-2">
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
                                                    {(previewUrl || fileUrl) && (
                                                        <a
                                                            href={previewUrl || fileUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white"
                                                            title="View PDF"
                                                        >
                                                            👁️ View
                                                        </a>
                                                    )}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                                                        title="Remove file"
                                                    >
                                                        ×
                                                    </button>
                                                </div>
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
                                                {(previewUrl || fileUrl) && (
                                                    <a
                                                        href={previewUrl || fileUrl}
                                                        download={fileName}
                                                        className="btn btn-sm bg-green-500 hover:bg-green-600 text-white"
                                                        title="Download file"
                                                    >
                                                        ⬇️ Download
                                                    </a>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFile(index)}
                                                    className="btn btn-sm bg-red-500 hover:bg-red-600 text-white"
                                                    title="Remove file"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
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
                        <span className="mr-2">✓</span> Update Notice
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
                            <h2 className="text-2xl font-bold mb-4">Notice Updated Successfully</h2>
                            <p className="text-gray-600 mb-6">
                                Your notice "{formData.noticeTitle}" has been updated successfully.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <button
                                    onClick={() => {
                                        const savedState = localStorage.getItem('noticeBoardState');
                                        navigate('/notice-board', { 
                                            state: { 
                                                refresh: true,
                                                restoreState: savedState ? JSON.parse(savedState) : null
                                            } 
                                        });
                                    }}
                                    className="btn btn-outline btn-primary"
                                >
                                    View Notice
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

export default EditNotice;

