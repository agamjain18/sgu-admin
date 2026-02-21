import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Trash2, RefreshCcw, User, MessageSquare, Briefcase } from 'lucide-react';
import { api } from '../api';
import { showToast } from '../components/Toast';

export default function JobApplications() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const data = await api.getInquiries();
      // Only keep job applications
      setInquiries(data.filter(i => i.subject === 'Job Apply'));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await api.deleteInquiry(id);
        setInquiries(inquiries.filter(i => i.id !== id));
        showToast('Application deleted successfully!');
      } catch (err) {
        showToast('Failed to delete: ' + err.message, 'error');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-serif text-slate-900">Job Applications</h1>
          <p className="text-slate-500 font-medium">Manage and review candidates who applied through the Careers page.</p>
        </div>
        <button 
          onClick={fetchInquiries}
          className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl px-6 py-3 text-sm font-bold transition-all active:scale-95 shadow-sm text-slate-700"
        >
          <RefreshCcw size={18} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-medium animate-pulse">Retrieving applications...</div>
        ) : error ? (
          <div className="py-20 text-center text-red-500 bg-red-50">Error: {error}</div>
        ) : inquiries.length === 0 ? (
          <div className="py-20 text-center space-y-4">
            <Briefcase size={48} className="mx-auto text-slate-200" />
            <p className="text-slate-500 font-medium font-serif italic text-lg">No job applications received yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {inquiries.map((inquiry) => (
              <div key={inquiry.id} className="p-8 hover:bg-slate-50/50 transition-colors group">
                <div className="flex flex-col lg:flex-row gap-8">
                  {/* Left: Applicant Info */}
                  <div className="lg:w-1/3 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                        <User size={22} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg leading-tight text-slate-900">{inquiry.name}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/70">CANDIDATE</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                       <div className="flex items-center gap-3 text-sm text-slate-500 hover:text-primary transition-colors">
                        <Mail size={16} className="text-slate-400" />
                        <a href={`mailto:${inquiry.email}`} className="hover:underline">{inquiry.email}</a>
                      </div>
                      {inquiry.phone && (
                        <div className="flex items-center gap-3 text-sm text-slate-500 hover:text-primary transition-colors">
                          <Phone size={16} className="text-slate-400" />
                          <a href={`tel:${inquiry.phone}`} className="hover:underline">{inquiry.phone}</a>
                        </div>
                      )}
                      <div className="flex items-center gap-3 text-sm text-slate-400">
                        <Calendar size={16} className="text-slate-300" />
                        <span>{inquiry.created_at}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Message Content */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-slate-400">
                        <MessageSquare size={10} /> Application Details
                      </div>
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button 
                          onClick={() => handleDelete(inquiry.id)}
                          className="p-2.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm active:scale-95" 
                          title="Delete Application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-slate-700 leading-relaxed text-sm italic relative whitespace-pre-line">
                      {inquiry.message}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
