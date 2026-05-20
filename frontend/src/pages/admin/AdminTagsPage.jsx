import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Edit, Check, X } from 'lucide-react';
import api from '../../services/api';

const AdminTagsPage = () => {
  const queryClient = useQueryClient();
  const [newTag, setNewTag] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const [error, setError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tags'],
    queryFn: () => api.get('/tags').then((res) => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (name) => api.post('/tags', { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      setNewTag('');
      setError('');
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to create tag'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }) => api.put(`/tags/${id}`, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      setEditId(null);
      setEditName('');
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to update tag'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tags/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['tags']);
      setDeleteId(null);
    },
    onError: (err) => setError(err.response?.data?.message || 'Failed to delete tag'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    createMutation.mutate(newTag.trim());
  };

  const handleEdit = (tag) => {
    setEditId(tag._id);
    setEditName(tag.name);
  };

  const handleUpdate = (id) => {
    if (!editName.trim()) return;
    updateMutation.mutate({ id, name: editName.trim() });
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
          Tags
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your article tags
        </p>
      </div>

      {/* Create Tag Form */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-6 mb-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4">Add New Tag</h2>
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Tag name"
            className="flex-1 px-4 py-2.5 rounded-xl border border-pink-100 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:border-pink-400 text-sm"
          />
          <button
            type="submit"
            disabled={createMutation.isPending || !newTag.trim()}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm"
          >
            <Plus size={16} />
            Add
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* Tags List */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-pink-50 dark:bg-gray-900 rounded-2xl h-16" />
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <p className="text-center text-gray-400 py-10">No tags yet.</p>
      ) : (
        <div className="space-y-3">
          {data.data.map((tag) => (
            <div
              key={tag._id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 px-5 py-4 flex items-center gap-4"
            >
              {editId === tag._id ? (
                <>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-lg border border-pink-200 dark:border-pink-900 bg-white dark:bg-gray-950 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-pink-400"
                    autoFocus
                  />
                  <button
                    onClick={() => handleUpdate(tag._id)}
                    disabled={updateMutation.isPending}
                    className="p-2 rounded-lg text-green-500 hover:bg-green-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    onClick={() => setEditId(null)}
                    className="p-2 rounded-lg text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </>
              ) : (
                <>
                  <div className="flex-1">
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tag.name}
                    </span>
                    {tag.isDefault && (
                      <span className="ml-2 text-xs text-pink-500 font-bold bg-pink-50 dark:bg-pink-950 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleEdit(tag)}
                    className="p-2 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  {!tag.isDefault && (
                    <button
                      onClick={() => setDeleteId(tag._id)}
                      className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-pink-100 dark:border-pink-950 p-8 max-w-sm w-full">
            <h3 className="font-display font-black text-xl text-gray-900 dark:text-white mb-2">
              Delete tag?
            </h3>
            <p className="text-gray-500 text-sm mb-6">
              This will permanently delete this tag. Articles using this tag will need to be updated.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-full border border-pink-100 dark:border-pink-900 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:border-pink-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2.5 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTagsPage;