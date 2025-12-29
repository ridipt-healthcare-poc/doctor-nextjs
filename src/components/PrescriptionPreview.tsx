'use client';

import { FileText, Download, Calendar, User, Pill } from 'lucide-react';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions?: string;
}

interface PrescriptionData {
    _id: string;
    prescriptionType: 'uploaded' | 'generated';
    fileUrl: string;
    fileName: string;
    diagnosis?: string;
    symptoms?: string;
    medications?: Medication[];
    labTests?: string[];
    followUpDate?: string;
    notes?: string;
    status: 'draft' | 'issued' | 'cancelled';
    issuedAt?: string;
    createdAt: string;
    doctorId?: {
        name: string;
        specialization?: string;
    };
    appointmentId?: {
        appointmentDate: string;
        appointmentDateTime: string;
    };
}

interface PrescriptionPreviewProps {
    prescription: PrescriptionData;
    onEdit?: () => void;
    onIssue?: () => void;
    onDownload?: () => void;
}

export default function PrescriptionPreview({
    prescription,
    onEdit,
    onIssue,
    onDownload
}: PrescriptionPreviewProps) {
    const handleDownload = () => {
        if (onDownload) {
            onDownload();
        } else {
            // Default download behavior
            const downloadUrl = `${process.env.NEXT_PUBLIC_API_URL}${prescription.fileUrl}`;
            window.open(downloadUrl, '_blank');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-start mb-6 pb-4 border-b">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="text-blue-600" size={28} />
                        Prescription Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Created on {formatDate(prescription.createdAt)}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${prescription.status === 'issued'
                                ? 'bg-green-100 text-green-800'
                                : prescription.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                            }`}
                    >
                        {prescription.status.charAt(0).toUpperCase() + prescription.status.slice(1)}
                    </span>
                </div>
            </div>

            {/* Prescription Type Badge */}
            <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                    {prescription.prescriptionType === 'uploaded' ? '📄 Uploaded File' : '📝 Generated Prescription'}
                </span>
            </div>

            {/* Generated Prescription Details */}
            {prescription.prescriptionType === 'generated' && (
                <div className="space-y-6">
                    {/* Diagnosis */}
                    {prescription.diagnosis && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Diagnosis</h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{prescription.diagnosis}</p>
                        </div>
                    )}

                    {/* Symptoms */}
                    {prescription.symptoms && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Symptoms</h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{prescription.symptoms}</p>
                        </div>
                    )}

                    {/* Medications */}
                    {prescription.medications && prescription.medications.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <Pill size={18} className="text-blue-600" />
                                Medications
                            </h3>
                            <div className="space-y-3">
                                {prescription.medications.map((med, index) => (
                                    <div key={index} className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <div className="flex items-start gap-3">
                                            <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                                                {index + 1}
                                            </span>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-800 mb-2">{med.name}</p>
                                                <div className="grid grid-cols-2 gap-2 text-sm">
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Dosage:</span> {med.dosage}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Frequency:</span> {med.frequency}
                                                    </p>
                                                    <p className="text-gray-700">
                                                        <span className="font-medium">Duration:</span> {med.duration}
                                                    </p>
                                                    {med.instructions && (
                                                        <p className="text-gray-700 col-span-2">
                                                            <span className="font-medium">Instructions:</span> {med.instructions}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Lab Tests */}
                    {prescription.labTests && prescription.labTests.length > 0 && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommended Lab Tests</h3>
                            <ul className="list-disc list-inside bg-gray-50 p-3 rounded-lg space-y-1">
                                {prescription.labTests.map((test, index) => (
                                    <li key={index} className="text-gray-800">{test}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Follow-up Date */}
                    {prescription.followUpDate && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                <Calendar size={18} className="text-blue-600" />
                                Follow-up Date
                            </h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">
                                {formatDate(prescription.followUpDate)}
                            </p>
                        </div>
                    )}

                    {/* Additional Notes */}
                    {prescription.notes && (
                        <div>
                            <h3 className="text-sm font-semibold text-gray-700 mb-2">Additional Notes</h3>
                            <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{prescription.notes}</p>
                        </div>
                    )}
                </div>
            )}

            {/* Uploaded Prescription Details */}
            {prescription.prescriptionType === 'uploaded' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center gap-3">
                        <FileText className="text-blue-600" size={40} />
                        <div>
                            <p className="font-medium text-gray-800">{prescription.fileName}</p>
                            {prescription.notes && (
                                <p className="text-sm text-gray-600 mt-1">{prescription.notes}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                    onClick={handleDownload}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download size={20} />
                    Download PDF
                </button>

                {prescription.status === 'draft' && onEdit && (
                    <button
                        onClick={onEdit}
                        className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Edit
                    </button>
                )}

                {prescription.status === 'draft' && onIssue && (
                    <button
                        onClick={onIssue}
                        className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Issue to Patient
                    </button>
                )}
            </div>
        </div>
    );
}
