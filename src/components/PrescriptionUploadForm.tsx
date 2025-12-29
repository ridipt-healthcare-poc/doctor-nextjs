'use client';

import { useState } from 'react';
import { Upload, X, FileText } from 'lucide-react';

interface PrescriptionUploadFormProps {
    appointmentId: string;
    patientName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PrescriptionUploadForm({
    appointmentId,
    patientName,
    onSuccess,
    onCancel
}: PrescriptionUploadFormProps) {
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [notes, setNotes] = useState('');
    const [saveAsDraft, setSaveAsDraft] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];

            // Validate file type
            const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!allowedTypes.includes(selectedFile.type)) {
                alert('Please upload a PDF or image file (JPG, PNG)');
                return;
            }

            // Validate file size (15MB max)
            if (selectedFile.size > 15 * 1024 * 1024) {
                alert('File size must be less than 15MB');
                return;
            }

            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result as string);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setPreview(null);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!file) {
            alert('Please select a file to upload');
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('prescriptionFile', file);
            formData.append('appointmentId', appointmentId);
            formData.append('notes', notes);

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`
                },
                body: formData
            });

            const data = await response.json();

            if (data.success) {
                // If not saving as draft, issue immediately
                if (!saveAsDraft) {
                    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/${data.data._id}/issue`, {
                        method: 'POST',
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                }

                alert(saveAsDraft ? 'Prescription uploaded and saved as draft' : 'Prescription uploaded and issued successfully!');
                onSuccess?.();
            } else {
                alert(data.message || 'Failed to upload prescription');
            }
        } catch (error) {
            console.error('Error uploading prescription:', error);
            alert('Failed to upload prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Upload Prescription</h2>
                    <p className="text-sm text-gray-600 mt-1">Patient: {patientName}</p>
                </div>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={24} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* File Upload */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Prescription File *
                    </label>

                    <div className="mt-2">
                        <label
                            htmlFor="file-upload"
                            className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            {file ? (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileText className="w-12 h-12 text-blue-500 mb-3" />
                                    <p className="text-sm text-gray-700 font-medium">{file.name}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            setFile(null);
                                            setPreview(null);
                                        }}
                                        className="mt-3 text-sm text-red-600 hover:text-red-700"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Upload className="w-12 h-12 text-gray-400 mb-3" />
                                    <p className="mb-2 text-sm text-gray-500">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        PDF, JPG, or PNG (Max 15MB)
                                    </p>
                                </div>
                            )}
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>

                    {/* Image Preview */}
                    {preview && (
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
                            <img
                                src={preview}
                                alt="Prescription preview"
                                className="max-w-full h-auto rounded-lg border border-gray-300"
                            />
                        </div>
                    )}
                </div>

                {/* Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any additional notes about this prescription"
                        rows={3}
                    />
                </div>

                {/* Save as Draft Checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="saveAsDraft"
                        checked={saveAsDraft}
                        onChange={(e) => setSaveAsDraft(e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="saveAsDraft" className="ml-2 text-sm text-gray-700">
                        Save as draft (don't issue to patient yet)
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
                        disabled={loading || !file}
                    >
                        {loading ? 'Uploading...' : saveAsDraft ? 'Upload as Draft' : 'Upload & Issue Prescription'}
                    </button>
                </div>
            </form>
        </div>
    );
}
