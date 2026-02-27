import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldHalved, ChartLine, RotateCcw, FileWarning, Hourglass, CheckCircle2, IndianRupee, PieChart, Users, SlidersHorizontal, Search, XIcon, List, Fingerprint, LogOut } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ThemeToggle from '../components/ThemeToggle';

const API = 'http://localhost:5000';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const adminName = sessionStorage.getItem('userName') || 'Admin';

    const [activeTab, setActiveTab] = useState('complaints');
    const [complaints, setComplaints] = useState([]);
    const [filteredComplaints, setFilteredComplaints] = useState([]);
    const [logins, setLogins] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolvedToday: 0, totalRefunded: 0, resolutionRate: 0, totalUsers: 0 });
    const [loading, setLoading] = useState(true);

    // Filters
    const [filters, setFilters] = useState({ status: '', amount: '', date: '', searchId: '' });

    useEffect(() => {
        const role = sessionStorage.getItem('userRole');
        if (!role || (role !== 'admin' && role !== 'manager')) {
            navigate('/admin-login');
        } else {
            loadComplaints();
            loadStats();
        }
    }, [navigate]);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/complaints`);
            const data = await res.json();
            const list = data.complaints || [];
            setComplaints(list);
            applyFiltersState(list, filters);
        } catch {
            console.error('Failed to load complaints');
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const res = await fetch(`${API}/api/admin/stats`);
            const s = await res.json();
            setStats({
                total: s.total,
                pending: s.pending,
                resolvedToday: s.resolvedToday,
                totalRefunded: s.totalRefunded || 0,
                resolutionRate: s.resolutionRate,
                totalUsers: s.totalUsers
            });
        } catch { }
    };

    const loadLogins = async () => {
        if (logins.length > 0) return; // cache
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/admin/logins`);
            const data = await res.json();
            setLogins(data.logins || []);
        } catch {
            console.error('Failed to load logins');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'logins') loadLogins();
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/admin-login');
    };

    const applyFiltersState = (list, currentFilters) => {
        let filtered = [...list];
        if (currentFilters.status) filtered = filtered.filter(c => c.status === currentFilters.status);
        if (currentFilters.searchId) {
            const q = currentFilters.searchId.toLowerCase();
            filtered = filtered.filter(c => (c.id || '').toLowerCase().includes(q) || (c.transaction_id || '').toLowerCase().includes(q));
        }
        if (currentFilters.amount === '0-5000') filtered = filtered.filter(c => Number(c.amount) <= 5000);
        if (currentFilters.amount === '5000-10000') filtered = filtered.filter(c => Number(c.amount) > 5000 && Number(c.amount) <= 10000);
        if (currentFilters.amount === '10000+') filtered = filtered.filter(c => Number(c.amount) > 10000);

        setFilteredComplaints(filtered);
    };

    const updateFilter = (key, val) => {
        const newFilters = { ...filters, [key]: val };
        setFilters(newFilters);
        applyFiltersState(complaints, newFilters);
    };

    const resetFilters = () => {
        const empty = { status: '', amount: '', date: '', searchId: '' };
        setFilters(empty);
        applyFiltersState(complaints, empty);
    };

    const updateComplaintStatus = async (id, status) => {
        try {
            const res = await fetch(`${API}/api/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            const data = await res.json();
            if (status === 'resolved') alert(`✅ Approved!\nRefund Ref: ${data.refNumber}`);
            else alert('❌ Complaint Rejected.');

            // Reload
            loadComplaints();
            loadStats();
        } catch {
            alert('Failed to update status.');
        }
    };

    const getBadgeClass = (status) => {
        switch (status) {
            case 'new': return 'badge-new';
            case 'pending': return 'badge-pending';
            case 'resolved': return 'badge-resolved';
            case 'rejected': return 'badge-rejected';
            default: return 'badge-new';
        }
    };

    return (
        <div className="admin-theme">
            <nav className="navbar">
                <div className="nav-brand">
                    <div className="brand-icon-wrap">
                        <div className="brand-icon-bg">
                            <ShieldHalved className="icon-main" />
                        </div>
                        <div className="brand-icon-orbit">₹</div>
                    </div>
                    <div className="brand-text-wrap">
                        <div className="brand-name">UPI Rapid</div>
                        <div className="brand-tagline">Command Center</div>
                    </div>
                </div>

                <div className="nav-right">
                    <div className="live-pill">
                        <div className="live-dot"></div> LIVE
                    </div>
                    <ThemeToggle />
                    <div className="nav-user">
                        <div className="nav-avatar">{adminName.charAt(0).toUpperCase()}</div>
                        <span>{adminName}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </nav>

            <div className="container" style={{ maxWidth: '1440px', margin: '0 auto', padding: '48px 32px 100px', position: 'relative', zIndex: 10 }}>

                {/* Header */}
                <div className="page-header" style={{ marginBottom: '44px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <div className="page-eyebrow"><ChartLine size={12} /> Real-Time Management</div>
                        <div className="page-title">Command Center</div>
                        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '8px' }}>Monitor, resolve, and manage all UPI disputes in real time</div>
                    </div>
                    <button className="btn-refresh" onClick={() => { loadComplaints(); loadStats(); }}>
                        <RotateCcw size={14} /> Refresh
                    </button>
                </div>

                {/* Stats */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><FileWarning size={20} /></div>
                        <div className="stat-label">Total Complaints</div>
                        <div className="stat-value">{stats.total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Hourglass size={20} /></div>
                        <div className="stat-label">Pending Review</div>
                        <div className="stat-value">{stats.pending}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><CheckCircle2 size={20} /></div>
                        <div className="stat-label">Resolved Today</div>
                        <div className="stat-value">{stats.resolvedToday}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><IndianRupee size={20} /></div>
                        <div className="stat-label">Total Refunded</div>
                        <div className="stat-value">₹{Number(stats.totalRefunded).toLocaleString('en-IN')}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><PieChart size={20} /></div>
                        <div className="stat-label">Resolution Rate</div>
                        <div className="stat-value">{stats.resolutionRate}%</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon"><Users size={20} /></div>
                        <div className="stat-label">Registered Users</div>
                        <div className="stat-value">{stats.totalUsers}</div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filter-panel">
                    <div className="filter-title"><SlidersHorizontal size={14} /> Filters & Search</div>
                    <div className="filter-grid">
                        <div>
                            <label className="filter-label">Status</label>
                            <select className="filter-select" value={filters.status} onChange={e => updateFilter('status', e.target.value)}>
                                <option value="">All Statuses</option>
                                <option value="new">New</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <label className="filter-label">Amount Range</label>
                            <select className="filter-select" value={filters.amount} onChange={e => updateFilter('amount', e.target.value)}>
                                <option value="">All Amounts</option>
                                <option value="0-5000">₹0 – ₹5,000</option>
                                <option value="5000-10000">₹5,000 – ₹10,000</option>
                                <option value="10000+">₹10,000+</option>
                            </select>
                        </div>
                        <div>
                            <label className="filter-label">Filed Date</label>
                            <input type="date" className="filter-input" value={filters.date} onChange={e => updateFilter('date', e.target.value)} />
                        </div>
                        <div>
                            <label className="filter-label">Search ID</label>
                            <div style={{ position: 'relative' }}>
                                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                                <input type="text" className="filter-input" style={{ paddingLeft: '30px' }} placeholder="CMP... or TXN..." value={filters.searchId} onChange={e => updateFilter('searchId', e.target.value)} />
                            </div>
                        </div>
                        <div className="filter-btns">
                            <button className="btn-clear" onClick={resetFilters} title="Clear">
                                <XIcon size={16} /> Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="tab-row">
                    <div className="tab-bar-inner">
                        <button className={`tab-btn ${activeTab === 'complaints' ? 'active' : ''}`} onClick={() => handleTabChange('complaints')}>
                            <List size={14} /> Active Complaints <span className="tab-count">{complaints.length}</span>
                        </button>
                        <button className={`tab-btn ${activeTab === 'logins' ? 'active' : ''}`} onClick={() => handleTabChange('logins')}>
                            <Fingerprint size={14} /> Login Logs <span className="tab-count">{logins.length}</span>
                        </button>
                    </div>
                </div>

                {/* Content: Complaints */}
                {activeTab === 'complaints' && (
                    <div className="glass-card table-card">
                        <div className="card-header">
                            <div className="card-title">
                                <div className="card-title-icon"><List size={18} /></div>
                                All Complaints
                            </div>
                            <span className="card-count" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Showing real-time data</span>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Complaint ID</th>
                                        <th>Transaction ID</th>
                                        <th>User</th>
                                        <th>Amount</th>
                                        <th>Issue</th>
                                        <th>Status</th>
                                        <th>Filed</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px' }}><div className="spin" style={{ display: 'inline-block' }}><RotateCcw size={24} /></div></td></tr>
                                    ) : filteredComplaints.length === 0 ? (
                                        <tr><td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No complaints found matching filters.</td></tr>
                                    ) : (
                                        filteredComplaints.map(c => (
                                            <tr key={c.id}>
                                                <td><code className="code-id">{c.id}</code></td>
                                                <td><span className="code-txn">{c.transaction_id || '—'}</span></td>
                                                <td>
                                                    <div style={{ fontWeight: '700' }}>{c.user_name || '—'}</div>
                                                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.user_email || ''}</div>
                                                </td>
                                                <td><strong style={{ fontSize: '14px' }}>₹{Number(c.amount || 0).toLocaleString('en-IN')}</strong></td>
                                                <td><span style={{ fontSize: '12px' }}>{c.issue_type || 'N/A'}</span></td>
                                                <td><span className={`badge ${getBadgeClass(c.status)}`}>{(c.status || 'new').toUpperCase()}</span></td>
                                                <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{(c.filed_date || '').split('T')[0]}</td>
                                                <td>
                                                    <div className="action-wrap">
                                                        {(c.status === 'new' || c.status === 'pending') ? (
                                                            <>
                                                                <button className="btn-approve" onClick={() => updateComplaintStatus(c.id, 'resolved')}><CheckCircle2 size={12} /> Approve</button>
                                                                <button className="btn-reject" onClick={() => updateComplaintStatus(c.id, 'rejected')}><XIcon size={12} /> Reject</button>
                                                            </>
                                                        ) : (
                                                            <span className={`badge ${getBadgeClass(c.status)}`} style={{ opacity: 0.7 }}>{c.status.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Content: Logins */}
                {activeTab === 'logins' && (
                    <div className="glass-card table-card">
                        <div className="card-header">
                            <div className="card-title">
                                <div className="card-title-icon"><Fingerprint size={18} /></div>
                                Login Activity Log
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Name / Username</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>IP Address</th>
                                        <th>Login Time</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px' }}>Loading logs...</td></tr>
                                    ) : logins.length === 0 ? (
                                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No login records yet.</td></tr>
                                    ) : (
                                        logins.map((log, i) => {
                                            const ok = log.status === 'success';
                                            const roleClass = log.user_type === 'admin' ? 'role-admin' : (log.user_type === 'manager' ? 'role-manager' : 'role-user');
                                            return (
                                                <tr key={i}>
                                                    <td style={{ color: 'var(--text-muted)', fontFamily: 'Space Mono, monospace', fontSize: '11px' }}>{i + 1}</td>
                                                    <td><strong>{log.username}</strong></td>
                                                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{log.email || '—'}</td>
                                                    <td><span className={`role-pill ${roleClass}`}>{(log.user_type || 'user').toUpperCase()}</span></td>
                                                    <td style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>{log.ip_address || '—'}</td>
                                                    <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.login_time).toLocaleString('en-IN')}</td>
                                                    <td><span className={`badge ${ok ? 'badge-success' : 'badge-failed'}`}>{ok ? '✅ Success' : '❌ Failed'}</span></td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <style>{`
                .navbar {
                    position: sticky; top: 0; z-index: 200;
                    background: var(--nav-bg); backdrop-filter: blur(28px); border-bottom: 1px solid var(--border);
                    padding: 0 48px; height: 72px; display: flex; align-items: center; justify-content: space-between;
                    box-shadow: 0 1px 0 var(--border), 0 4px 24px rgba(0,0,0,0.1);
                }

                .nav-brand { display: flex; align-items: center; gap: 14px; text-decoration: none; }

                /* Crazy Composite Icon */
                .brand-icon-wrap { position: relative; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
                .brand-icon-bg {
                    width: 48px; height: 48px; border-radius: 14px;
                    background: linear-gradient(135deg, #991B1B, #EF4444, #F97316);
                    display: flex; align-items: center; justify-content: center;
                    animation: iconPulse 3s ease-in-out infinite; box-shadow: 0 0 28px rgba(239,68,68,0.7), 0 0 60px rgba(239,68,68,0.3); position: relative; overflow: hidden;
                }
                .brand-icon-bg::before { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.12)); }
                .brand-icon-bg .icon-main { font-size: 22px; color: #fff; z-index: 1; position: relative; }
                .brand-icon-orbit {
                    position: absolute; top: -4px; right: -4px; width: 18px; height: 18px; border-radius: 50%;
                    background: linear-gradient(135deg, #FCD34D, #F59E0B); display: flex; align-items: center; justify-content: center;
                    font-size: 9px; color: #fff; font-weight: 800; box-shadow: 0 0 12px rgba(245,158,11,0.8);
                    animation: orbitSpin 4s linear infinite; border: 1.5px solid rgba(255,255,255,0.3);
                }
                @keyframes iconPulse {
                    0%,100% { box-shadow: 0 0 28px rgba(239,68,68,0.7), 0 0 60px rgba(239,68,68,0.3); }
                    50%     { box-shadow: 0 0 45px rgba(239,68,68,0.9), 0 0 100px rgba(239,68,68,0.4), 0 0 140px rgba(249,115,22,0.2); }
                }
                @keyframes orbitSpin {
                    0%   { transform: rotate(0deg) translateX(24px) rotate(0deg); }
                    100% { transform: rotate(360deg) translateX(24px) rotate(-360deg); }
                }
                
                .brand-text-wrap { display: flex; flex-direction: column; line-height: 1; }
                .brand-name { font-family: 'Playfair Display', serif; font-size: 18px; font-weight: 900; letter-spacing: -0.3px; }
                [data-theme="dark"] .brand-name { background: linear-gradient(120deg, #FFF, #FCA5A5, #EF4444); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                [data-theme="light"] .brand-name { background: linear-gradient(120deg, #111827, #DC2626, #991B1B); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
                .brand-tagline { font-size: 10px; color: var(--text-muted); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-top: 2px; }

                .nav-right { display: flex; align-items: center; gap: 12px; }
                .live-pill { display: flex; align-items: center; gap: 7px; padding: 7px 15px; border-radius: 30px; border: 1px solid rgba(34,197,94,0.3); background: rgba(34,197,94,0.1); font-size: 11px; font-weight: 700; color: #4ADE80; letter-spacing: 0.5px; }
                .live-dot { width: 7px; height: 7px; background: #22C55E; border-radius: 50%; animation: livePulse 1.8s infinite; flex-shrink: 0; }
                @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,197,94,0.5)} 50%{box-shadow:0 0 0 7px rgba(34,197,94,0)} }

                .nav-user { display: flex; align-items: center; gap: 10px; padding: 7px 16px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 30px; font-size: 13px; font-weight: 600; color: var(--text-primary); }
                .nav-avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg, #991B1B, #EF4444); display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: white; box-shadow: 0 0 14px rgba(239,68,68,0.5); }
                .logout-btn { display: flex; align-items: center; gap: 8px; padding: 9px 18px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); color: #F87171; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700; transition: var(--transition); }
                .logout-btn:hover { background: rgba(239,68,68,0.22); border-color: rgba(239,68,68,0.5); transform: translateY(-1px); }

                .page-eyebrow { display: inline-flex; align-items: center; gap: 8px; padding: 5px 14px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.25); border-radius: 20px; font-size: 11px; font-weight: 700; color: #F87171; letter-spacing: 0.7px; text-transform: uppercase; margin-bottom: 14px; }
                .page-title { font-family: 'Playfair Display', serif; font-size: 48px; font-weight: 900; line-height: 1.05; letter-spacing: -1px; }
                [data-theme="dark"] .page-title { background: linear-gradient(135deg, #ffffff 0%, #FCA5A5 35%, #EF4444 65%, #F97316 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 0 24px rgba(239,68,68,0.4)); }
                [data-theme="light"] .page-title { background: linear-gradient(135deg, #111827 0%, #DC2626 50%, #991B1B 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }

                .btn-refresh { display: flex; align-items: center; gap: 8px; padding: 12px 22px; background: var(--bg-surface); border: 1px solid var(--border); color: var(--text-secondary); border-radius: 12px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; transition: var(--transition); }
                .btn-refresh:hover { border-color: var(--border-accent); background: var(--bg-elevated); }

                /* Stats */
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 18px; margin-bottom: 40px; }
                .stat-card { background: var(--bg-surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 20px; padding: 26px 22px; position: relative; overflow: hidden; transition: var(--transition); cursor: default; }
                .stat-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(90deg, #991B1B, #EF4444, #F97316); border-radius: 3px 3px 0 0; }
                .stat-card::after { content: ''; position: absolute; bottom: -30px; right: -30px; width: 100px; height: 100px; border-radius: 50%; background: var(--card-glow); filter: blur(30px); pointer-events: none; transition: var(--transition); }
                .stat-card:hover { transform: translateY(-7px); box-shadow: var(--shadow-card), 0 0 0 1px var(--border-accent); }
                .stat-card:hover::after { width: 140px; height: 140px; }
                .stat-icon { width: 44px; height: 44px; border-radius: 13px; margin-bottom: 14px; background: rgba(239,68,68,0.15); border: 1px solid rgba(239,68,68,0.25); display: flex; align-items: center; justify-content: center; font-size: 18px; color: #F87171; box-shadow: 0 0 16px rgba(239,68,68,0.25); transition: var(--transition); }
                .stat-card:hover .stat-icon { box-shadow: 0 0 24px rgba(239,68,68,0.45); transform: scale(1.1); }
                .stat-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
                .stat-value { font-size: 30px; font-weight: 900; background: var(--stat-gradient); -webkit-background-clip: text; -webkit-text-fill-color: transparent; font-family: 'Space Mono', monospace; }

                /* Filter Panel */
                .filter-panel { background: var(--bg-surface); backdrop-filter: blur(20px); border: 1px solid var(--border); border-radius: 20px; padding: 26px 30px; margin-bottom: 28px; transition: var(--transition); }
                .filter-title { font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-bottom: 18px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.6px; }
                .filter-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 14px; align-items: end; }
                .filter-label { font-size: 10px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 7px; display: block; }
                .filter-input, .filter-select { width: 100%; padding: 11px 14px; background: var(--input-bg); border: 1.5px solid var(--border); border-radius: 11px; font-size: 13px; color: var(--text-primary); font-family: 'Poppins', sans-serif; transition: var(--transition); outline: none; }
                [data-theme="light"] .filter-select { background: white; }
                [data-theme="dark"] .filter-select option { background: #1a0202; }
                [data-theme="light"] .filter-select option { background: white; color: #111; }
                .filter-input:focus, .filter-select:focus { border-color: rgba(239,68,68,0.6); box-shadow: 0 0 0 3px rgba(239,68,68,0.12); }
                .btn-clear { padding: 11px 16px; background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-secondary); border-radius: 11px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; transition: var(--transition); display:flex; align-items:center; gap:6px; }
                .btn-clear:hover { color: var(--text-primary); border-color: var(--border-accent); }

                /* Tabs */
                .tab-row { display: flex; align-items: center; gap: 6px; margin-bottom: 24px; }
                .tab-bar-inner { display: flex; gap: 4px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 14px; padding: 5px; }
                .tab-btn { padding: 10px 24px; border: none; border-radius: 10px; cursor: pointer; font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 700; transition: var(--transition); background: transparent; color: var(--text-muted); display: flex; align-items: center; gap: 8px; white-space: nowrap; }
                .tab-btn.active { background: var(--tab-active); color: white; box-shadow: 0 4px 18px rgba(153,27,27,0.5); }
                .tab-btn:not(.active):hover { background: var(--bg-elevated); color: var(--text-primary); }
                .tab-count { background: rgba(239,68,68,0.25); color: #F87171; border-radius: 20px; padding: 2px 8px; font-size: 10px; font-weight: 800; }
                .tab-btn.active .tab-count { background: rgba(255,255,255,0.2); color: white; }

                /* Table */
                .table-card { background: var(--bg-surface); backdrop-filter: blur(24px); border: 1px solid var(--border); border-radius: 22px; position: relative; overflow: hidden; margin-bottom: 30px; transition: var(--transition); box-shadow: var(--shadow-card); }
                .table-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--border-accent), transparent); }
                .card-header { padding: 28px 32px 0; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-bottom: 20px; }
                .card-title { font-size: 18px; font-weight: 800; color: var(--text-primary); display: flex; align-items: center; gap: 10px; }
                .card-title-icon { width: 38px; height: 38px; border-radius: 11px; background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.3); display: flex; align-items: center; justify-content: center; color: #F87171; box-shadow: 0 0 16px rgba(239,68,68,0.3); }
                
                .table-wrap { overflow-x: auto; padding: 0; }
                table { width: 100%; border-collapse: collapse; }
                thead tr { background: var(--table-head); }
                th { padding: 13px 20px; text-align: left; font-size: 10px; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.9px; white-space: nowrap; }
                td { padding: 15px 20px; font-size: 13px; color: var(--text-primary); border-bottom: 1px solid var(--border); transition: background 0.2s; }
                tbody tr:last-child td { border-bottom: none; }
                tbody tr:hover td { background: var(--row-hover); }

                .code-id { font-family:'Space Mono', monospace; font-size:11px; color:#F87171; background:rgba(239,68,68,0.1); padding:3px 7px; border-radius:6px; font-weight:700; }
                .code-txn { font-family:'Space Mono', monospace; font-size:11px; color:var(--text-muted); }

                .badge { display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; letter-spacing: 0.3px; white-space: nowrap; }
                .badge-new      { background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3); }
                .badge-pending  { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }
                .badge-resolved { background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3); }
                .badge-rejected { background: rgba(239,68,68,0.12); color: #F87171; border: 1px solid rgba(239,68,68,0.25); }
                .badge-success  { background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3); }
                .badge-failed   { background: rgba(239,68,68,0.12); color: #F87171; border: 1px solid rgba(239,68,68,0.25); }
                [data-theme="light"] .badge-new      { background: rgba(59,130,246,0.1); }
                [data-theme="light"] .badge-resolved { background: rgba(16,185,129,0.1); }

                .action-wrap { display: flex; gap: 7px; }
                .btn-approve, .btn-reject { padding: 6px 14px; border-radius: 9px; cursor: pointer; font-size: 12px; font-weight: 700; transition: var(--transition); border: 1px solid; display: inline-flex; align-items: center; gap: 5px; }
                .btn-approve { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.3); color: #34D399; }
                .btn-approve:hover { background: rgba(16,185,129,0.25); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(16,185,129,0.25); }
                .btn-reject { background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.25); color: #F87171; }
                .btn-reject:hover { background: rgba(239,68,68,0.2); transform: translateY(-2px); box-shadow: 0 6px 18px rgba(239,68,68,0.25); }

                .role-pill { display: inline-flex; padding: 4px 10px; border-radius: 12px; font-size: 10px; font-weight: 800; letter-spacing: 0.5px; text-transform:uppercase; }
                .role-admin   { background: rgba(239,68,68,0.15); color: #F87171; border: 1px solid rgba(239,68,68,0.3); }
                .role-manager { background: rgba(139,92,246,0.15); color: #A78BFA; border: 1px solid rgba(139,92,246,0.3); }
                .role-user    { background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3); }
                                
                .spin { animation: spin 1s linear infinite; }
            `}</style>
        </div>
    );
};

export default AdminDashboard;
