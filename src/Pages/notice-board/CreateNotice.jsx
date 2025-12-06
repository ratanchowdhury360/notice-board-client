import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import Swal from 'sweetalert2';

const API_BASE_URL = 'https://notice-board-server-rho.vercel.app';

const CreateNotice = () => {
    const navigate = useNavigate();
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
                const key = file.name + file.size;
                newUrls[key] = URL.createObjectURL(file);
            }
        });
        // Update file preview URLs first
        setFilePreviewUrls(prev => {
            const updated = { ...prev, ...newUrls };
            return updated;
        });
        // Then update attachments
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
        // Clear the input so same file can be selected again
        e.target.value = '';
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
        if (typeof file === 'string') return false;
        const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        return imageTypes.includes(file.type) || /\.(jpg|jpeg|png|gif|webp)$/i.test(file.name);
    };

    const isPdfFile = (file) => {
        if (typeof file === 'string') return /\.pdf$/i.test(file);
        return file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    };

    const getFilePreviewUrl = (file) => {
        if (typeof file === 'string') return null;
        if (file instanceof File) {
            const key = file.name + file.size;
            // Return URL from state if available
            return filePreviewUrls[key] || null;
        }
        return null;
    };

    const handleSubmit = (e, action) => {
        e.preventDefault();

        // Validate required fields
        if (!formData.targetType) {
            alert('Please select Target Department(s) or Individual');
            return;
        }

        if (!formData.noticeType) {
            alert('Please select Notice Type');
            return;
        }

        // If Individual, validate required fields
        if (formData.targetType === 'Individual') {
            if (!formData.employeeId || formData.employeeId.trim() === '') {
                alert('Please enter Employee ID');
                return;
            }
            if (!formData.position) {
                alert('Please select Position');
                return;
            }
        }

        // If Department, validate departments are selected
        if (formData.targetType === 'Department' && formData.departments.length === 0) {
            alert('Please select at least one Department');
            return;
        }

        if (action === 'draft') {
            // Save as draft
            const draftData = {
                ...formData,
                status: 'Draft',
                isPublished: false,
                id: Date.now(),
                lastUpdated: new Date().toISOString()
            };

            // save this notice data to the database (via server)
            fetch(`${API_BASE_URL}/notice`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(draftData)
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.insertedId || data.message) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Draft Saved Successfully!',
                            text: 'Your notice has been saved as a draft.',
                            confirmButtonColor: '#3b82f6',
                            confirmButtonText: 'OK',
                            customClass: {
                                popup: 'rounded-lg shadow-xl',
                                title: 'text-gray-800 font-bold text-xl',
                                htmlContainer: 'text-gray-600 text-base',
                                confirmButton: 'px-6 py-2 rounded-lg font-medium'
                            },
                            buttonsStyling: false
                        }).then(() => {
                            navigate('/notice-board');
                        });
                    }
                })
                .catch((err) => {
                    console.error('Error saving draft:', err);
                    console.error('API URL:', API_BASE_URL);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to save draft. Please try again.',
                        confirmButtonColor: '#ef4444',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'rounded-lg shadow-xl',
                            title: 'text-gray-800 font-bold text-xl',
                            htmlContainer: 'text-gray-600 text-base'
                        }
                    });
                });
        } else if (action === 'publish') {
            // Publish notice
            const noticeData = {
                ...formData,
                status: 'Published',
                isPublished: true,
                id: Date.now(),
                publishedOn: formData.publishDate || new Date().toISOString().split('T')[0],
                lastUpdated: new Date().toISOString(),
                department: formData.targetType === 'Department'
                    ? (formData.departments.length > 0 ? formData.departments.join(', ') : 'All Department')
                    : 'Individual',
                departmentColor: 'blue'
            };

            // save this notice data to the database (via server)
            fetch(`${API_BASE_URL}/notice`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(noticeData)
            })
                .then(res => {
                    if (!res.ok) {
                        throw new Error(`HTTP error! status: ${res.status}`);
                    }
                    return res.json();
                })
                .then(data => {
                    if (data.insertedId || data.message) {
                        Swal.fire({
                            icon: 'success',
                            title: 'Notice Published Successfully!',
                            html: `
                                <div style="text-align: center;">
                                    <p style="color: #4b5563; font-size: 16px; margin-bottom: 8px;">
                                        Your notice <strong style="color: #1f2937;">"${formData.noticeTitle || 'Untitled Notice'}"</strong> has been published
                                    </p>
                                    <p style="color: #6b7280; font-size: 14px; margin-top: 8px;">
                                        It is now visible to all selected departments.
                                    </p>
                                </div>
                            `,
                            showCancelButton: true,
                            showDenyButton: true,
                            confirmButtonText: 'View Notice',
                            denyButtonText: 'Create Another',
                            cancelButtonText: 'Close',
                            confirmButtonColor: '#3b82f6',
                            denyButtonColor: '#f97316',
                            cancelButtonColor: '#6b7280',
                            customClass: {
                                popup: 'rounded-lg shadow-2xl border border-gray-200',
                                title: 'text-gray-800 font-bold text-2xl mb-4',
                                htmlContainer: 'text-left',
                                confirmButton: 'px-6 py-2 rounded-lg font-medium mr-2',
                                denyButton: 'px-6 py-2 rounded-lg font-medium mr-2',
                                cancelButton: 'px-6 py-2 rounded-lg font-medium'
                            },
                            buttonsStyling: false,
                            width: '500px'
                        }).then((result) => {
                            if (result.isConfirmed) {
                                navigate('/notice-board');
                            } else if (result.isDenied) {
                                // Reset form and stay on page
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
                                // Clear file preview URLs
                                Object.values(filePreviewUrls).forEach(url => {
                                    URL.revokeObjectURL(url);
                                });
                                setFilePreviewUrls({});
                            } else {
                                navigate('/notice-board');
                            }
                        });
                    }
                })
                .catch((err) => {
                    console.error('Error publishing notice:', err);
                    console.error('API URL:', API_BASE_URL);
                    Swal.fire({
                        icon: 'error',
                        title: 'Publication Failed',
                        text: 'Failed to publish notice. Please try again.',
                        confirmButtonColor: '#ef4444',
                        confirmButtonText: 'OK',
                        customClass: {
                            popup: 'rounded-lg shadow-xl',
                            title: 'text-gray-800 font-bold text-xl',
                            htmlContainer: 'text-gray-600 text-base'
                        }
                    });
                });
        }
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
                        className={`select select-bordered w-full text-gray-800 border-gray-300 focus:border-blue-500 ${formData.targetType === 'Individual' ? 'bg-blue-50' : 'bg-white'
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
                        <span className="label-text text-gray-800 font-semibold">Notice Title</span>
                    </label>
                    <input
                        type="text"
                        placeholder="Write the Title of Notice (optional)"
                        className="input input-bordered w-full text-gray-800 placeholder:text-gray-400 bg-white border-gray-300 focus:border-blue-500"
                        value={formData.noticeTitle}
                        onChange={(e) => handleInputChange('noticeTitle', e.target.value)}
                    />
                </div>

                {/* Employee Details (if Individual) */}
                {formData.targetType === 'Individual' && (
                    <>
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div>
                                <label className="label">
                                    <span className="label-text text-gray-800 font-semibold">Employee ID <span className="text-red-500">*</span></span>
                                </label>
                                <div className="space-y-2">
                                    <select
                                        id="employee-id-select"
                                        className="select select-bordered w-full text-gray-800 bg-white border-gray-300 focus:border-blue-500"
                                        value={formData.employeeId && ['EMP001', 'EMP002'].includes(formData.employeeId) ? formData.employeeId : ''}
                                        onChange={(e) => {
                                            handleInputChange('employeeId', e.target.value);
                                        }}
                                    >
                                        <option value="" className="text-gray-400">Select from list</option>
                                        <option value="EMP001">EMP001</option>
                                        <option value="EMP002">EMP002</option>
                                    </select>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-px bg-gray-300"></div>
                                        <span className="text-xs text-gray-500 px-2">OR</span>
                                        <div className="flex-1 h-px bg-gray-300"></div>
                                    </div>
                                    <input
                                        type="text"
                                        id="employee-id-input"
                                        placeholder="Type Employee ID manually"
                                        className="input input-bordered w-full text-gray-800 placeholder:text-gray-400 bg-white border-gray-300 focus:border-blue-500"
                                        value={formData.employeeId}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            handleInputChange('employeeId', value);
                                            // Clear select if typing manually (not a dropdown value)
                                            if (value && !['EMP001', 'EMP002'].includes(value)) {
                                                const select = document.getElementById('employee-id-select');
                                                if (select) select.value = '';
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Select from dropdown or type manually</p>
                            </div>
                            <div>
                                <label className="label">
                                    <span className="label-text text-gray-800 font-semibold">Employee Name</span>
                                </label>
                                <input
                                    type="text"
                                    placeholder="Enter employee full name (optional)"
                                    className="input input-bordered w-full text-gray-800 placeholder:text-gray-400 bg-white border-gray-300 focus:border-blue-500"
                                    value={formData.employeeName}
                                    onChange={(e) => handleInputChange('employeeName', e.target.value)}
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
                            <span className="label-text text-gray-800 font-semibold">Publish Date</span>
                        </label>
                        <input
                            type="date"
                            className="input input-bordered w-full text-gray-800 bg-blue-50 border-gray-300 focus:border-blue-500 custom-date"
                            placeholder="Select Publishing Date (optional)"
                            value={formData.publishDate}
                            onChange={(e) => handleInputChange('publishDate', e.target.value)}
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

                                return (
                                    <div key={index} className="border border-gray-300 rounded-lg p-4 bg-white">
                                        {isImage ? (
                                            <div className="space-y-2">
                                                <div className="relative">
                                                    {previewUrl ? (
                                                        <img
                                                            src={previewUrl}
                                                            alt={fileName}
                                                            className="max-w-full h-auto max-h-64 rounded-lg border border-gray-200"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const errorDiv = e.target.nextSibling;
                                                                if (errorDiv) errorDiv.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div style={{ display: 'none' }} className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
                                                        <span className="text-gray-500">Image not available</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFile(index)}
                                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 shadow-lg z-10"
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
                                                    {previewUrl && (
                                                        <a
                                                            href={previewUrl}
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
                                                {previewUrl && (
                                                    <a
                                                        href={previewUrl}
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
                        <span className="mr-2">✓</span> Publish Notice
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateNotice;

