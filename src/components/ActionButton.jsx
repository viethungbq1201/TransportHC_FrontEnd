import React from 'react';

const colorMap = {
    blue: 'text-blue-600   hover:bg-blue-50   border-blue-200',
    green: 'text-emerald-600 hover:bg-emerald-50 border-emerald-200',
    red: 'text-red-600     hover:bg-red-50     border-red-200',
    amber: 'text-amber-600   hover:bg-amber-50   border-amber-200',
    slate: 'text-slate-600   hover:bg-slate-100   border-slate-200',
    indigo: 'text-indigo-600  hover:bg-indigo-50  border-indigo-200',
    purple: 'text-purple-600  hover:bg-purple-50  border-purple-200',
    cyan: 'text-cyan-600    hover:bg-cyan-50    border-cyan-200',
    rose: 'text-rose-600    hover:bg-rose-50    border-rose-200',
};

const ActionButton = ({ onClick, icon: Icon, title, color = 'slate', disabled = false }) => {
    const cls = colorMap[color] || colorMap.slate;
    return (
        <button
            onClick={onClick}
            title={title}
            disabled={disabled}
            className={`w-8 h-8 inline-flex items-center justify-center rounded-full border transition-colors
                ${cls}
                ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
};

export default ActionButton;
