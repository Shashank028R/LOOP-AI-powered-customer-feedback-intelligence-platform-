import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../AuthContext';
import GlassPanel from '../components/GlassPanel';
import { UserPlus, UserX, UserCheck, ShieldAlert, Sparkles, RefreshCw, Mail, Lock, User } from 'lucide-react';

const Settings = () => {
  const { token, user } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Invite state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [invitePassword, setInvitePassword] = useState('');
  const [inviteRole, setInviteRole] = useState('VIEWER');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' }); // success or error

  const fetchMembers = () => {
    setLoading(true);
    fetch(`${API_URL}/workspace/members`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setMembers(data.members);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching members:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMembers();
  }, [token]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteName || !inviteEmail || !invitePassword) {
      setMessage({ text: 'Please fill in all invite fields', type: 'error' });
      return;
    }

    setInviteLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const res = await fetch(`${API_URL}/workspace/members/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: inviteName,
          email: inviteEmail,
          password: invitePassword,
          role: inviteRole
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Invitation failed');
      }

      setMessage({ text: 'Teammate invited successfully!', type: 'success' });
      setInviteName('');
      setInviteEmail('');
      setInvitePassword('');
      setInviteRole('VIEWER');
      fetchMembers();
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRoleChange = async (targetUserId, newRole) => {
    try {
      const res = await fetch(`${API_URL}/workspace/members/${targetUserId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to update role');
      }
      
      // Update local state
      setMembers(members.map(m => m._id === targetUserId ? { ...m, role: newRole } : m));
      alert('Teammate role updated successfully!');
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRemove = async (targetUserId, memberName) => {
    if (!window.confirm(`Are you absolutely sure you want to remove ${memberName} from this workspace?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_URL}/workspace/members/${targetUserId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to remove member');
      }

      setMembers(members.filter(m => m._id !== targetUserId));
      alert('Teammate removed successfully.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-amber-400 text-glow-purple">
          Workspace Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage workspace members, assign RBAC roles, and control access permissions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Invite Member form */}
        <div className="lg:col-span-1 space-y-6">
          <GlassPanel glowColor="purple">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-amber-400" />
              <span>Invite Teammate</span>
            </h3>

            {message.text && (
              <div className={`px-4 py-3 rounded-xl text-xs font-semibold mb-4 flex items-center space-x-2 border ${
                message.type === 'success' 
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' 
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-300'
              }`}>
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{message.text}</span>
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Teammate Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sujal Bhatt"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    placeholder="sujal@company.io"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Temporary Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={invitePassword}
                    onChange={(e) => setInvitePassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/5 focus:border-amber-500/50 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-400 font-semibold uppercase">Access Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full bg-slate-900 border border-white/5 focus:border-amber-500/50 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none"
                >
                  <option value="VIEWER">VIEWER (Read-Only)</option>
                  <option value="ANALYST">ANALYST (Triage & Ingestion)</option>
                  <option value="ADMIN">ADMIN (Full Access)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={inviteLoading}
                className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-gray-950 font-bold py-2.5 rounded-xl shadow-neon-purple transition-all text-xs flex items-center justify-center space-x-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{inviteLoading ? 'Sending...' : 'Invite Member'}</span>
              </button>
            </form>
          </GlassPanel>
        </div>

        {/* Members list table */}
        <div className="lg:col-span-2 space-y-6">
          <GlassPanel glowColor="none" className="h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-base font-bold text-slate-100">Active Workspace Members</h3>
                <button 
                  onClick={fetchMembers}
                  className="flex items-center space-x-1.5 px-3 py-1.5 border border-white/10 hover:bg-white/5 text-[10px] font-bold rounded-lg text-slate-300 transition-all"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Sync</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-slate-400 border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider text-left">
                      <th className="py-3 px-4">Member Info</th>
                      <th className="py-3 px-4">Workspace Role</th>
                      <th className="py-3 px-4 text-right">Revoke Access</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {members.map((member) => (
                      <tr key={member._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-200">{member.name}</div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">{member.email}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          {member._id === user?.id ? (
                            <span className="flex items-center space-x-1 text-xs text-amber-400 font-semibold font-mono bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-lg w-fit">
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>{member.role} (YOU)</span>
                            </span>
                          ) : (
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member._id, e.target.value)}
                              className="bg-slate-900 border border-white/5 focus:border-amber-500/30 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                            >
                              <option value="VIEWER">VIEWER</option>
                              <option value="ANALYST">ANALYST</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {member._id !== user?.id && (
                            <button
                              onClick={() => handleRemove(member._id, member.name)}
                              className="p-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 hover:border-rose-500/30 rounded-lg text-rose-400 transition-all ml-auto block"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </GlassPanel>
        </div>

      </div>
    </div>
  );
};

export default Settings;
