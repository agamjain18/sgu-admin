import { useState, useEffect } from 'react';
import { User, Bell, Lock, Globe, Database, Save, Loader2, Shield, Share2, Instagram, Linkedin, Pin } from 'lucide-react';
import { api } from '../api';
import { showToast } from '../components/Toast';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [socialLinks, setSocialLinks] = useState({
    facebook_url: '',
    instagram_url: '',
    linkedin_url: '',
    twitter_url: '',
    pinterest_url: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await api.getSettings();
        const links = { ...socialLinks };
        settings.forEach(s => {
          if (links.hasOwnProperty(s.key)) {
            links[s.key] = s.value;
          }
        });
        setSocialLinks(links);
      } catch (err) {
        console.error('Failed to fetch settings:', err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      if (activeTab === 'social') {
        const promises = Object.entries(socialLinks).map(([key, value]) => 
          api.updateSetting(key, value)
        );
        await Promise.all(promises);
        showToast('Social media links updated!');
      } else {
        await new Promise(resolve => setTimeout(resolve, 1000));
        showToast('Settings saved successfully!');
      }
    } catch (err) {
      showToast('Error saving settings: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'social', icon: Share2, label: 'Social Media' },
  ];

  return (
    <div className="space-y-8 animate-in zoom-in duration-500 pb-20 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 font-serif text-slate-900">Settings</h1>
          <p className="text-slate-500">Manage your admin account and system preferences.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="bg-primary hover:bg-primary-hover text-white px-8 py-3 rounded-2xl transition-all shadow-lg shadow-primary/20 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>{loading ? 'Saving Changes...' : 'Save Settings'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-medium text-left ${
                  isActive 
                    ? 'bg-primary/5 text-primary border border-primary/20 shadow-sm' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent'
                }`}
              >
                <tab.icon size={20} className={isActive ? 'text-primary' : 'text-slate-400'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="md:col-span-3">
          <div className="bg-white border border-slate-200 rounded-[2rem] p-8 min-h-[500px] shadow-sm">
            {activeTab === 'profile' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
                  <div className="w-20 h-20 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-primary font-bold text-2xl">
                    AU
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Admin Profile</h2>
                    <p className="text-sm text-slate-500">Update your personal information and email.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">First Name</label>
                    <input type="text" defaultValue="Admin" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Last Name</label>
                    <input type="text" defaultValue="User" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input type="email" defaultValue="admin@sgu.com" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'social' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                  <Share2 className="text-primary" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Social Media Links</h2>
                    <p className="text-sm text-slate-500">Manage links displayed in the website footer.</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-2xl">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Share2 size={14} className="text-[#1877F2]" /> Facebook URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://facebook.com/..." 
                          value={socialLinks.facebook_url}
                          onChange={(e) => setSocialLinks({...socialLinks, facebook_url: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Instagram size={14} className="text-[#E4405F]" /> Instagram URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://instagram.com/..." 
                          value={socialLinks.instagram_url}
                          onChange={(e) => setSocialLinks({...socialLinks, instagram_url: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Linkedin size={14} className="text-[#0A66C2]" /> LinkedIn URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://linkedin.com/company/..." 
                          value={socialLinks.linkedin_url}
                          onChange={(e) => setSocialLinks({...socialLinks, linkedin_url: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Globe size={14} className="text-[#1DA1F2]" /> Twitter URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://twitter.com/..." 
                          value={socialLinks.twitter_url}
                          onChange={(e) => setSocialLinks({...socialLinks, twitter_url: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" 
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">
                          <Pin size={14} className="text-[#E60023]" /> Pinterest URL
                        </label>
                        <input 
                          type="text" 
                          placeholder="https://pinterest.com/..." 
                          value={socialLinks.pinterest_url}
                          onChange={(e) => setSocialLinks({...socialLinks, pinterest_url: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all text-slate-900" 
                        />
                      </div>
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                 <div className="flex items-center gap-3 border-b border-slate-100 pb-6">
                  <Shield className="text-red-500" size={24} />
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Security & Password</h2>
                    <p className="text-sm text-slate-500">Manage your password and security settings.</p>
                  </div>
                </div>

                <div className="space-y-6 max-w-md">
                   <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Current Password</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">New Password</label>
                    <input type="password" placeholder="New strong password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all text-slate-900" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Confirm New Password</label>
                    <input type="password" placeholder="Repeat new password" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 text-sm focus:outline-none focus:border-red-400 focus:bg-white transition-all text-slate-900" />
                  </div>
                  <button className="bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-900 px-6 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm">
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {activeTab !== 'profile' && activeTab !== 'security' && activeTab !== 'social' && (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50 py-20">
                <Globe size={48} className="text-slate-300" />
                <h3 className="text-xl font-medium text-slate-900">Undefined View</h3>
                <p className="text-sm max-w-md text-slate-500">The requested settings view is not available.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
