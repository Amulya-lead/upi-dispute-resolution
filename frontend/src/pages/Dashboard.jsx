import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, AlertCircle, FileText, IndianRupee, ShieldAlert, BadgeCheck, XCircle, LogOut, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ThemeToggle from '../components/ThemeToggle';

const API = 'http://localhost:5000';

const Dashboard = () => {
    const navigate = useNavigate();
    const userName = sessionStorage.getItem('userName') || 'User';

    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0 });
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);

    // Form state
    const [form, setForm] = useState({ amount: '', transactionId: '', issueType: 'fraud', description: '' });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const token = sessionStorage.getItem('token');
        const role = sessionStorage.getItem('userRole');
        if (!token || role !== 'user') {
            navigate('/');
        } else {
            loadComplaints();
        }
    }, [navigate]);

    const loadComplaints = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API}/api/complaints/mine`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });

            if (res.status === 401) {
                // Token is invalid/expired on the server. Force logout.
                handleLogout();
                return;
            }

            const data = await res.json();
            const list = data.complaints || [];
            setComplaints(list);

            const st = { total: list.length, pending: 0, resolved: 0, rejected: 0 };
            list.forEach(c => {
                if (c.status === 'resolved') st.resolved++;
                else if (c.status === 'rejected') st.rejected++;
                else st.pending++;
            });
            setStats(st);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.clear();
        navigate('/');
    };

    const submitComplaint = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const res = await fetch(`${API}/api/complaints`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    amount: form.amount,
                    transactionId: form.transactionId,
                    issueType: form.issueType,
                    description: form.description,
                    email: sessionStorage.getItem('userEmail'),
                    userName: sessionStorage.getItem('userName')
                })
            });
            if (res.status === 401) {
                alert("Session expired. Please log in again.");
                handleLogout();
                return;
            }

            const data = await res.json();

            if (data.success) {
                alert(`✅ Complaint Filed! Tracking ID: ${data.complaintId}`);
                setShowModal(false);
                setForm({ amount: '', transactionId: '', issueType: 'fraud', description: '' });
                loadComplaints();
            } else {
                alert(`Error: ${data.message || 'Submission failed'}`);
            }
        } catch {
            alert('Network error. Cannot reach server.');
        } finally {
            setSubmitting(false);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'resolved': return <span className="badge badge-resolved"><BadgeCheck size={12} /> Resolved</span>;
            case 'rejected': return <span className="badge badge-rejected"><XCircle size={12} /> Rejected</span>;
            case 'pending': return <span className="badge badge-pending"><AlertCircle size={12} /> Pending</span>;
            default: return <span className="badge badge-new"><ShieldAlert size={12} /> Reviewing</span>;
        }
    };

    return (
        <>
            <nav className="navbar">
                <div className="nav-brand">
                    <div className="nav-brand-icon"><ShieldAlert size={20} /></div>
                    <span className="nav-brand-text">UPI Rapid Dashboard</span>
                </div>
                <div className="nav-right">
                    <ThemeToggle />
                    <div className="nav-user">
                        <div className="nav-avatar">{userName.charAt(0).toUpperCase()}</div>
                        <span>{userName}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </nav>

            <div className="container" style={{ position: 'relative', zIndex: 10, maxWidth: '1200px', margin: '0 auto', padding: '40px 20px 100px' }}>

                <div className="page-header" style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: '38px', fontWeight: '800', background: 'linear-gradient(135deg, var(--text-primary) 0%, #A855F7 50%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '8px' }}>
                            Welcome back, {userName.split(' ')[0]}
                        </h1>
                        <p style={{ color: 'var(--text-muted)' }}>Track your disputes and file new complaints instantly.</p>
                    </div>
                    <button className="btn-primary" onClick={() => setShowModal(true)}>
                        <PlusCircle size={18} /> File New Complaint
                    </button>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><FileText size={20} /></div>
                        <div className="stat-label">Total Filed</div>
                        <div className="stat-val">{stats.total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#F59E0B', background: 'rgba(245,158,11,0.15)', borderColor: 'rgba(245,158,11,0.3)' }}><AlertCircle size={20} /></div>
                        <div className="stat-label">Pending Action</div>
                        <div className="stat-val">{stats.pending}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#10B981', background: 'rgba(16,185,129,0.15)', borderColor: 'rgba(16,185,129,0.3)' }}><CheckCircle size={20} /></div>
                        <div className="stat-label">Resolved</div>
                        <div className="stat-val">{stats.resolved}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.15)', borderColor: 'rgba(239,68,68,0.3)' }}><XCircle size={20} /></div>
                        <div className="stat-label">Rejected</div>
                        <div className="stat-val">{stats.rejected}</div>
                    </div>
                </div>

                <GlassCard>
                    <div className="card-title">
                        <div className="card-title-icon"><LayoutDashboard size={18} /></div>
                        My Complaint History
                    </div>

                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th>Tracking ID</th>
                                    <th>Date Filed</th>
                                    <th>Issue Details</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spin" /> Loading data...</td></tr>
                                ) : complaints.length === 0 ? (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}><FileText size={32} style={{ opacity: 0.3, marginBottom: '10px' }} /><br />No complaints filed yet.</td></tr>
                                ) : (
                                    complaints.map(c => (
                                        <tr key={c.id}>
                                            <td><code style={{ color: '#A855F7', background: 'rgba(168,85,247,0.1)', padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}>{c.id}</code></td>
                                            <td style={{ color: 'var(--text-muted)' }}>{c.filed_date.split('T')[0]}</td>
                                            <td>
                                                <strong>{c.issue_type}</strong>
                                                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{c.transaction_id || 'No TXN ID'}</div>
                                            </td>
                                            <td><strong style={{ fontSize: '14px' }}>₹{Number(c.amount).toLocaleString('en-IN')}</strong></td>
                                            <td>{getStatusBadge(c.status)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>File New Complaint</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}><XCircle size={24} /></button>
                        </div>
                        <form onSubmit={submitComplaint}>
                            <div className="form-group">
                                <label className="form-label">Transaction ID / UTR</label>
                                <div className="input-wrap">
                                    <FileText className="input-icon" size={16} />
                                    <input type="text" className="form-input" required placeholder="e.g. 123456789012" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Disputed Amount (₹)</label>
                                <div className="input-wrap">
                                    <IndianRupee className="input-icon" size={16} />
                                    <input type="number" className="form-input" required placeholder="5000" min="1" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Issue Category</label>
                                <select className="form-input" value={form.issueType} onChange={e => setForm({ ...form, issueType: e.target.value })} style={{ paddingLeft: '16px' }}>
                                    <option value="fraud">Fraudulent Transaction</option>
                                    <option value="wrong_transfer">Sent to wrong person</option>
                                    <option value="merchant_issue">Merchant didn't provide service</option>
                                    <option value="technical">Technical Failure (Amount deducted)</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Detailed Description</label>
                                <textarea className="form-input" required rows="3" placeholder="Explain what happened..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} style={{ paddingLeft: '16px', resize: 'none' }}></textarea>
                            </div>

                            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '16px' }} disabled={submitting}>
                                {submitting ? <Loader2 className="spin" size={18} /> : <ShieldAlert size={18} />}
                                &nbsp;{submitting ? 'Submitting...' : 'Submit to NPCI Resolvers'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
        .navbar {
            position: sticky; top: 0; z-index: 100;
            background: var(--nav-bg); backdrop-filter: blur(24px); border-bottom: 1px solid var(--border);
            padding: 0 40px; height: 72px; display: flex; align-items: center; justify-content: space-between;
        }
        .nav-brand { display: flex; align-items: center; gap: 12px; color: var(--text-primary); font-weight: 800; font-size: 20px; }
        .nav-brand-icon {
            width: 40px; height: 40px; border-radius: 12px;
            background: linear-gradient(135deg, rgba(168,85,247,0.4), rgba(236,72,153,0.3));
            border: 1px solid var(--border-accent);
            display: flex; align-items: center; justify-content: center; color: #F0ABFC;
        }
        .nav-right { display: flex; align-items: center; gap: 16px; }
        .nav-user {
            display: flex; align-items: center; gap: 10px; padding: 6px 16px 6px 6px;
            background: var(--bg-surface); border: 1px solid var(--border); border-radius: 30px;
            font-size: 13px; font-weight: 600; color: var(--text-primary);
        }
        .nav-avatar {
            width: 32px; height: 32px; border-radius: 50%;
            background: linear-gradient(135deg, #A855F7, #EC4899); display: flex; align-items: center; justify-content: center;
            font-size: 13px; font-weight: 800; color: white;
        }
        .logout-btn {
            display: flex; align-items: center; gap: 8px; padding: 10px 18px;
            background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25);
            color: #FCA5A5; border-radius: 12px; cursor: pointer; font-size: 13px; font-weight: 700;
            transition: var(--transition);
        }
        .logout-btn:hover { background: rgba(239,68,68,0.2); }
        [data-theme="light"] .logout-btn { background: white; color: var(--red-vivid); }

        .btn-primary {
            display: inline-flex; align-items: center; justify-content: center; gap: 8px;
            padding: 14px 24px; background: linear-gradient(135deg, #A855F7, #EC4899);
            color: white; border: none; border-radius: 14px; font-weight: 700; font-size: 14px;
            cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 24px rgba(168,85,247,0.4);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 30px rgba(168,85,247,0.6); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card {
            background: var(--bg-surface); backdrop-filter: blur(20px);
            border: 1px solid var(--border); border-radius: 20px; padding: 24px;
            transition: var(--transition); position: relative; overflow: hidden;
        }
        .stat-card:hover { transform: translateY(-4px); border-color: var(--border-accent); box-shadow: var(--shadow-card); }
        .stat-icon {
            width: 44px; height: 44px; border-radius: 12px; margin-bottom: 16px;
            background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3);
            display: flex; align-items: center; justify-content: center; color: #F0ABFC;
        }
        .stat-label { font-size: 11px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .stat-val { font-size: 32px; font-weight: 800; color: var(--text-primary); font-family: 'Space Mono', monospace; }

        .card-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; display: flex; align-items: center; gap: 10px; color: var(--text-primary); }
        .card-title-icon { width: 36px; height: 36px; border-radius: 10px; background: rgba(168,85,247,0.15); border: 1px solid rgba(168,85,247,0.3); display: flex; align-items: center; justify-content: center; color: #F0ABFC; }
        
        table { width: 100%; border-collapse: collapse; }
        thead tr { background: var(--bg-elevated); }
        th { padding: 14px 20px; text-align: left; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; border-bottom: 1px solid var(--border); }
        td { padding: 16px 20px; font-size: 13px; color: var(--text-primary); border-bottom: 1px solid var(--border); transition: background 0.2s; }
        tbody tr:hover { background: var(--bg-elevated); }
        
        .badge { display: inline-flex; align-items: center; gap: 5px; padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; }
        .badge-new { background: rgba(59,130,246,0.15); color: #60A5FA; border: 1px solid rgba(59,130,246,0.3); }
        .badge-pending { background: rgba(245,158,11,0.15); color: #FCD34D; border: 1px solid rgba(245,158,11,0.3); }
        .badge-resolved { background: rgba(16,185,129,0.15); color: #34D399; border: 1px solid rgba(16,185,129,0.3); }
        .badge-rejected { background: rgba(239,68,68,0.15); color: #F87171; border: 1px solid rgba(239,68,68,0.3); }

        /* Modal */
        .modal-overlay {
            position: fixed; top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.7); backdrop-filter: blur(8px);
            z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;
            animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-content {
            background: var(--bg-base); border: 1px solid var(--border-accent);
            border-radius: 24px; width: 100%; max-width: 540px; padding: 32px;
            box-shadow: 0 32px 80px rgba(0,0,0,0.6); position: relative;
            animation: slideUp 0.4s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideUp { from { transform: translateY(40px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .modal-header h2 { font-family: 'Playfair Display', serif; font-size: 28px; }
        .modal-close { background: transparent; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.2s; }
        .modal-close:hover { color: var(--red-vivid); }
        
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .form-input {
            width: 100%; padding: 14px 16px; background: var(--input-bg);
            border: 1.5px solid var(--border); border-radius: 12px; font-size: 14px;
            color: var(--text-primary); font-family: 'Poppins', sans-serif; transition: all 0.3s;
        }
        .form-input:focus { border-color: var(--border-accent); outline: none; box-shadow: 0 0 0 3px rgba(168,85,247,0.2); }
        .form-input:focus ~ .input-icon { color: var(--text-primary); }
        .spin { animation: spin 1s linear infinite; }
      `}</style>
        </>
    );
};

export default Dashboard;
