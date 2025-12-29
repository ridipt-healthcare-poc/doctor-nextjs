'use client';

import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

interface Medication {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    instructions: string;
}

interface PrescriptionFormProps {
    appointmentId: string;
    patientName: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function PrescriptionForm({
    appointmentId,
    patientName,
    onSuccess,
    onCancel
}: PrescriptionFormProps) {
    const [loading, setLoading] = useState(false);
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');
    const [medications, setMedications] = useState<Medication[]>([
        { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
    ]);
    const [labTests, setLabTests] = useState<string[]>(['']);
    const [followUpDate, setFollowUpDate] = useState('');
    const [notes, setNotes] = useState('');
    const [saveAsDraft, setSaveAsDraft] = useState(false);

    const addMedication = () => {
        setMedications([
            ...medications,
            { name: '', dosage: '', frequency: '', duration: '', instructions: '' }
        ]);
    };

    const removeMedication = (index: number) => {
        setMedications(medications.filter((_, i) => i !== index));
    };

    const updateMedication = (index: number, field: keyof Medication, value: string) => {
        const updated = [...medications];
        updated[index][field] = value;
        setMedications(updated);
    };

    const addLabTest = () => {
        setLabTests([...labTests, '']);
    };

    const removeLabTest = (index: number) => {
        setLabTests(labTests.filter((_, i) => i !== index));
    };

    const updateLabTest = (index: number, value: string) => {
        const updated = [...labTests];
        updated[index] = value;
        setLabTests(updated);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Filter out empty medications and lab tests
            const validMedications = medications.filter(med => med.name.trim() !== '');
            const validLabTests = labTests.filter(test => test.trim() !== '');

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    appointmentId,
                    diagnosis,
                    symptoms,
                    medications: validMedications,
                    labTests: validLabTests,
                    followUpDate: followUpDate || null,
                    notes
                })
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

                alert(saveAsDraft ? 'Prescription saved as draft' : 'Prescription issued successfully!');
                onSuccess?.();
            } else {
                alert(data.message || 'Failed to create prescription');
            }
        } catch (error) {
            console.error('Error creating prescription:', error);
            alert('Failed to create prescription');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Create Prescription</h2>
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
                {/* Diagnosis */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Diagnosis *
                    </label>
                    <input
                        type="text"
                        value={diagnosis}
                        onChange={(e) => setDiagnosis(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter diagnosis"
                        required
                    />
                </div>

                {/* Symptoms */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Symptoms
                    </label>
                    <textarea
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Describe symptoms"
                        rows={3}
                    />
                </div>

                {/* Medications */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Medications *
                        </label>
                        <button
                            type="button"
                            onClick={addMedication}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Plus size={16} />
                            Add Medication
                        </button>
                    </div>

                    <div className="space-y-4">
                        {medications.map((med, index) => (
                            <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-sm font-medium text-gray-700">
                                        Medication {index + 1}
                                    </span>
                                    {medications.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMedication(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={med.name}
                                        onChange={(e) => updateMedication(index, 'name', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Medicine name *"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.dosage}
                                        onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Dosage (e.g., 500mg) *"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.frequency}
                                        onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Frequency (e.g., Twice daily) *"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.duration}
                                        onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Duration (e.g., 5 days) *"
                                        required
                                    />
                                    <input
                                        type="text"
                                        value={med.instructions}
                                        onChange={(e) => updateMedication(index, 'instructions', e.target.value)}
                                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent md:col-span-2"
                                        placeholder="Special instructions (e.g., Take after meals)"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lab Tests */}
                <div>
                    <div className="flex justify-between items-center mb-3">
                        <label className="block text-sm font-medium text-gray-700">
                            Recommended Lab Tests
                        </label>
                        <button
                            type="button"
                            onClick={addLabTest}
                            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                            <Plus size={16} />
                            Add Test
                        </button>
                    </div>

                    <div className="space-y-2">
                        {labTests.map((test, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={test}
                                    onChange={(e) => updateLabTest(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Lab test name"
                                />
                                {labTests.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeLabTest(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Follow-up Date */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Follow-up Date
                    </label>
                    <input
                        type="date"
                        value={followUpDate}
                        onChange={(e) => setFollowUpDate(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Additional Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Additional Notes
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Any additional instructions or notes"
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
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : saveAsDraft ? 'Save as Draft' : 'Create & Issue Prescription'}
                    </button>
                </div>
            </form>
        </div>
    );
}
