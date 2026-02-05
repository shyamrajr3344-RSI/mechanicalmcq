import React, { useEffect, useState } from 'react';
import { StoredResult } from '../types';

interface AdminDashboardProps {
  onBack: () => void;
}

interface AggregatedResult {
  ktuId: string;
  name: string;
  email: string;
  part1Score: string;
  part2Score: string;
  part3Score: string;
  lastUpdated: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [results, setResults] = useState<AggregatedResult[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const loadResults = () => {
    const storedData = localStorage.getItem('fluid_mechanics_exam_submissions');
    if (!storedData) {
      setResults([]);
      return;
    }

    const submissions: StoredResult[] = JSON.parse(storedData);
    const aggregated: Record<string, AggregatedResult> = {};

    submissions.forEach((sub) => {
      const key = sub.studentInfo.ktuId;
      if (!aggregated[key]) {
        aggregated[key] = {
          ktuId: sub.studentInfo.ktuId,
          name: sub.studentInfo.name,
          email: sub.studentInfo.email,
          part1Score: '-',
          part2Score: '-',
          part3Score: '-',
          lastUpdated: sub.timestamp,
        };
      }
      
      if (sub.examPart === 1) {
        aggregated[key].part1Score = `${sub.score}/${sub.total}`;
      } else if (sub.examPart === 2) {
        aggregated[key].part2Score = `${sub.score}/${sub.total}`;
      } else if (sub.examPart === 3) {
        aggregated[key].part3Score = `${sub.score}/${sub.total}`;
      }
      
      if (new Date(sub.timestamp) > new Date(aggregated[key].lastUpdated)) {
          aggregated[key].lastUpdated = sub.timestamp;
      }
    });

    setResults(Object.values(aggregated));
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleClearData = () => {
    if (window.confirm("Are you sure you want to delete ALL student records from this device? This cannot be undone.")) {
      localStorage.removeItem('fluid_mechanics_exam_submissions');
      loadResults();
    }
  };

  const downloadCSV = () => {
    const headers = ['KTU ID', 'Student Name', 'Email', 'Exam 1', 'Exam 2', 'Exam 3', 'Last Updated'];
    const rows = filteredResults.map(r => [
      r.ktuId,
      `"${r.name}"`, 
      r.email,
      r.part1Score,
      r.part2Score,
      r.part3Score,
      new Date(r.lastUpdated).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `exam_results_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredResults = results.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    r.ktuId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and export student performance records.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            >
              Back
            </button>
            <button
              onClick={handleClearData}
              className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
            >
              Clear Records
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-sm transition-colors flex items-center font-medium"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </button>
          </div>
        </div>

        {/* Search and Stats */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by Name or KTU ID..."
              className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="bg-blue-600 text-white px-6 py-3 rounded-xl shadow-md flex items-center justify-center whitespace-nowrap">
            <span className="font-bold text-xl mr-2">{results.length}</span>
            <span className="text-blue-100 text-sm font-medium uppercase tracking-wider">Students Registered</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">KTU ID</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exam 1</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exam 2</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Exam 3</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredResults.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center">
                        <svg className="w-12 h-12 text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        <span className="text-gray-400 font-medium">No student records found matching your search.</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredResults.map((r) => (
                    <tr key={r.ktuId} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{r.ktuId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{r.name}</div>
                        <div className="text-xs text-gray-500">{r.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.part1Score !== '-' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {r.part1Score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.part2Score !== '-' ? 'bg-purple-100 text-purple-800 border border-purple-200' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {r.part2Score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          r.part3Score !== '-' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-gray-100 text-gray-400'
                        }`}>
                          {r.part3Score}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {new Date(r.lastUpdated).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;