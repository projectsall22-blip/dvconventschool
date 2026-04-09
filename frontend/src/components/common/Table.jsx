import React from 'react';
import LoadingSpinner from './LoadingSpinner';

const Table = ({
  headers = [],
  children,
  isLoading = false,
  emptyMessage = 'No data found',
  emptyIcon = '📂',
  count = 0,
}) => {
  return (
    <div className="w-full">
      <div className="bg-white border border-slate-100/80 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-xs font-bold text-secondary uppercase tracking-wider whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={headers.length} className="py-20">
                    <LoadingSpinner size="lg" />
                  </td>
                </tr>
              ) : count === 0 ? (
                <tr>
                  <td colSpan={headers.length} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-2xl border border-slate-100">
                        {emptyIcon}
                      </div>
                      <p className="text-secondary font-semibold text-sm">{emptyMessage}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                children
              )}
            </tbody>
          </table>
        </div>

        {count > 0 && (
          <div className="px-6 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-secondary font-medium">
              Showing{' '}
              <span className="font-bold text-slate-700">{count}</span>{' '}
              {count === 1 ? 'entry' : 'entries'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Table;
