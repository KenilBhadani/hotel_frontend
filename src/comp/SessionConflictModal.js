import React from 'react';
import { AlertTriangle, LogOut, X } from 'lucide-react';

const SessionConflictModal = ({ currentUser, onForceLogout, onCancel }) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold">Session Conflict</h3>
                            <p className="text-sm text-white/90">Another user is already logged in</p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                        <p className="text-sm text-slate-600 mb-2">Currently logged in as:</p>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                                {currentUser.userName?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="font-bold text-slate-800">{currentUser.userName}</p>
                                <p className="text-xs text-slate-500">{currentUser.userEmail}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                    {currentUser.userType === 'guest' ? '👤 Guest' :
                                        currentUser.userType === 'admin' ? '⚙️ Admin' :
                                            '👔 Staff'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                        <p className="text-sm text-amber-800">
                            <strong>⚠️ Warning:</strong> Logging in as a different user will automatically logout the current user from all tabs.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-50 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                        <X size={18} />
                        Cancel
                    </button>
                    <button
                        onClick={onForceLogout}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-200"
                    >
                        <LogOut size={18} />
                        Logout & Continue
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionConflictModal;
