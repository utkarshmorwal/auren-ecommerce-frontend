import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Shield, User as UserIcon } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState('');

  const { data: users = [], isLoading: loading } = useQuery({
    queryKey: ['users', 'admin'],
    queryFn: () => api.get('/api/users/admin/all').then((res) => res.data),
    staleTime: 5 * 60 * 1000,
  });

  const handleToggleAdmin = async (targetUser) => {
    const isAdmin = targetUser.roles.includes('ADMIN');
    setError('');
    setUpdatingId(targetUser.id);
    try {
      const res = await api.put(`/api/users/admin/${targetUser.id}/role`, { makeAdmin: !isAdmin });
      queryClient.setQueryData(['users', 'admin'], (prev = []) =>
  prev.map((u) => (u.id === targetUser.id ? res.data : u))
);
    } catch (err) {
      const data = err?.response?.data;
      setError(typeof data?.message === 'string' ? data.message : 'Could not update role.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-4xl mb-8">Users</h1>

      {error && (
        <div className="text-sm text-ember bg-ember/10 border border-ember/20 rounded-lg px-4 py-3 mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-ink/40 font-mono text-sm">Loading...</p>
      ) : (
        <div className="bg-white/60 border border-stone rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone text-left text-xs uppercase tracking-widest text-ink/40">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isAdmin = u.roles.includes('ADMIN');
                const isSelf = currentUser?.id === u.id;
                return (
                  <tr key={u.id} className="border-b border-stone/60 last:border-0">
                    <td className="px-5 py-3 font-display whitespace-nowrap">
                      <span className="flex items-center gap-2">
                        <UserIcon size={14} strokeWidth={1.75} className="text-ink/30" />
                        {u.name}
                        {isSelf && <span className="text-[10px] text-ink/30 font-mono">(you)</span>}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink/60 whitespace-nowrap">{u.email}</td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span className={`flex items-center gap-1.5 w-fit text-xs font-mono uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isAdmin ? 'text-verdant bg-verdant/10' : 'text-ink/50 bg-stone'
                      }`}>
                        {isAdmin ? <ShieldCheck size={12} strokeWidth={1.75} /> : <Shield size={12} strokeWidth={1.75} />}
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleToggleAdmin(u)}
                        disabled={updatingId === u.id || (isSelf && isAdmin)}
                        className="px-4 py-1.5 rounded-full border border-stone text-xs text-ink/70 hover:border-verdant hover:text-verdant transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                      >
                        {updatingId === u.id ? '...' : isAdmin ? 'Remove admin' : 'Make admin'}
                      </motion.button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}