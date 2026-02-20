import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, TrendingUp, Users, Mail, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    products: 0,
    sectors: 0,
    inquiries: 0,
    activeUsers: 1 // Defaulting to 1 for the admin
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [products, inquiries] = await Promise.all([
          api.getProducts(),
          api.getInquiries()
        ]);

        // Calculate unique sectors
        const uniqueSectors = new Set(products.map(p => p.category).filter(Boolean));
        
        setStats({
          products: products.length,
          sectors: uniqueSectors.size || 0,
          inquiries: inquiries.length,
          activeUsers: 1
        });

        // Generate activities based on real data
        const activities = [];
        
        // Add recent products
        products.slice(0, 3).forEach(p => {
          activities.push({
            id: `p-${p.id}`,
            text: `New product "${p.name}" added to ${p.category || 'Catalog'}`,
            time: 'Recently',
            icon: Package,
            color: 'text-blue-500'
          });
        });

        // Add recent inquiries
        inquiries.slice(0, 2).forEach(i => {
          activities.push({
            id: `i-${i.id}`,
            text: `New inquiry from ${i.name}: ${i.subject}`,
            time: 'Recently',
            icon: Mail,
            color: 'text-purple-500'
          });
        });

        setRecentActivities(activities.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const statCards = [
    { label: 'Total Products', value: stats.products.toString(), icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+5%' },
    { label: 'Active Sectors', value: stats.sectors.toString(), icon: LayoutDashboard, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: 'Stable' },
    { label: 'Total Inquiries', value: stats.inquiries.toString(), icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+12%' },
    { label: 'System Users', value: stats.activeUsers.toString(), icon: Users, color: 'text-orange-600', bg: 'bg-orange-50', trend: 'Secure' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div>
        <h1 className="text-3xl font-bold mb-2 font-serif text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Real-time statistics and activities for SGU Trade management.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend === 'Stable' || stat.trend === 'Secure' ? 'bg-slate-100 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{stat.label}</h3>
            <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Recent Stream</h2>
            <Link to="/inquiries" className="text-primary text-sm font-medium hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex gap-4 items-start pb-6 border-b border-slate-50 last:border-0 last:pb-0">
                <div className={`p-2 rounded-lg bg-slate-50 ${activity.color}`}>
                  <activity.icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{activity.text}</p>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <Clock size={12} />
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            )) : (
              <p className="text-center py-10 text-slate-400">No recent activities found.</p>
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl shadow-sm">
          <h2 className="text-xl font-bold mb-8 text-slate-900">Management Suite</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/add-product" className="p-6 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-left block group">
              <Package className="text-primary mb-3 group-hover:scale-110 transition-transform" size={24} />
              <p className="font-bold text-slate-900">Catalog</p>
              <p className="text-xs text-slate-500 mt-1">Update products</p>
            </Link>
            <Link to="/inquiries" className="p-6 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl transition-all text-left block group">
              <Mail className="text-emerald-500 mb-3 group-hover:scale-110 transition-transform" size={24} />
              <p className="font-bold text-slate-900">Inbound</p>
              <p className="text-xs text-slate-500 mt-1">Review inquiries</p>
            </Link>
          </div>
          <div className="mt-6 p-6 bg-primary/5 rounded-2xl border border-primary/10">
            <h4 className="font-bold text-primary text-sm mb-2">System Health</h4>
            <div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
               <div className="bg-primary w-[98%] h-full rounded-full"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-tighter">Everything operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
