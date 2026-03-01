import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, AlertCircle, FileText, IndianRupee, ShieldAlert, BadgeCheck, XCircle, LogOut, CheckCircle, Wallet, ArrowRight, Smartphone, Sparkles, Loader2, Search, Send, Key } from 'lucide-react';
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
    const [showHistory, setShowHistory] = useState(false);

    // Payment Process State
    const [showPayModal, setShowPayModal] = useState(false);
    const [payStep, setPayStep] = useState(1); // 1: Recipient, 2: Amount, 3: PIN, 4: Processing, 5: Success
    const [payForm, setPayForm] = useState({ upiId: '', amount: '', pin: '' });
    const [balance, setBalance] = useState(25450.75);
    const [showBalance, setShowBalance] = useState(true);

    // Complaint Form state
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
                handleLogout();
                return;
            }

            const data = await res.json();
            const list = data.complaints || [];
            setComplaints(list);

            const st = { total: list.length, pending: 0, resolved: 0, rejected: 0 };
            list.forEach(c => {
                if (c.status === 'resolved') st.resolved++;
                else if (c.status.startsWith('rejected')) st.rejected++;
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
                handleLogout();
                return;
            }
            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setForm({ amount: '', transactionId: '', issueType: 'fraud', description: '' });
                loadComplaints();
            }
        } catch (e) { console.error(e); } finally { setSubmitting(false); }
    };

    const handlePayment = (e) => {
        e.preventDefault();
        if (payStep === 1) setPayStep(2);
        else if (payStep === 2) setPayStep(3);
        else if (payStep === 3) {
            setPayStep(4);
            setTimeout(() => {
                setPayStep(5);
                setBalance(prev => prev - parseFloat(payForm.amount));
            }, 3000);
        }
    };

    const resetPayment = () => {
        setShowPayModal(false);
        setPayStep(1);
        setPayForm({ upiId: '', amount: '', pin: '' });
    };

    const getStatusBadge = (status) => {
        if (status === 'resolved') return <span className="badge badge-resolved"><BadgeCheck size={12} /> Resolved</span>;
        if (status === 'pending') return <span className="badge badge-pending"><AlertCircle size={12} /> Pending</span>;
        return <span className="badge badge-new"><ShieldAlert size={12} /> Reviewing</span>;
    };

    return (
        <div className="dashboard-wrapper animate-entry">
            <nav className="navbar">
                <div className="nav-brand">
                    <div className="nav-brand-icon"><ShieldAlert size={20} /></div>
                    <span className="nav-brand-text">UPI Rapid</span>
                </div>
                <div className="nav-right">
                    <ThemeToggle />
                    <div className="nav-user">
                        <div className="nav-avatar">{userName.charAt(0).toUpperCase()}</div>
                        <span>{userName}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}><LogOut size={14} /></button>
                </div>
            </nav>

            <div className="main-content container">

                {/* Available Balance Card */}
                <div className="balance-grid">
                    <div className="balance-card glass-premium animate-float">
                        <div className="balance-info">
                            <div className="balance-label">
                                <Wallet size={16} /> Available Balance
                            </div>
                            <h2 className="balance-amount">
                                {showBalance ? `₹${balance.toLocaleString('en-IN')}` : '••••••••'}
                                <button className="balance-toggle" onClick={() => setShowBalance(!showBalance)}>
                                    {showBalance ? 'Hide' : 'Show'}
                                </button>
                            </h2>
                            <div className="balance-footer">
                                <div className="balance-badge"><Sparkles size={12} /> Premium Account</div>
                            </div>
                        </div>
                        <div className="balance-actions">
                            <button className="pay-btn" onClick={() => setShowPayModal(true)}>
                                <div className="pay-icon"><Send size={20} /></div>
                                <span>Send Money</span>
                            </button>
                        </div>
                    </div>

                    <div className="quick-actions">
                        <div className="action-card" onClick={() => setShowModal(true)}>
                            <div className="action-icon"><ShieldAlert size={20} /></div>
                            <span>Dispute</span>
                        </div>
                        <div className="action-card" onClick={() => setShowHistory(!showHistory)}>
                            <div className="action-icon"><FileText size={20} /></div>
                            <span>History</span>
                        </div>
                    </div>
                </div>

                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-label">Total Disputes</div>
                        <div className="stat-val">{stats.total}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Pending Action</div>
                        <div className="stat-val" style={{ color: 'var(--accent-gold)' }}>{stats.pending}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Resolved</div>
                        <div className="stat-val" style={{ color: 'var(--accent-green)' }}>{stats.resolved}</div>
                    </div>
                </div>

                {showHistory && (
                    <GlassCard className="history-card glass-premium animate-entry">
                        <div className="card-header">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h3 className="card-title"><LayoutDashboard size={18} /> Transaction Disputes</h3>
                                <button className="close-btn-small" onClick={() => setShowHistory(false)}><XCircle size={14} /></button>
                            </div>
                        </div>
                        <div className="table-wrap">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Tracking ID</th>
                                        <th>Date</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}><Loader2 className="spin" /></td></tr>
                                    ) : complaints.length === 0 ? (
                                        <tr><td colSpan="4" style={{ textAlign: 'center', padding: '40px' }}>No records found</td></tr>
                                    ) : (
                                        complaints.map(c => (
                                            <tr key={c.id}>
                                                <td className="id-cell"><code>{c.id}</code></td>
                                                <td>{c.filed_date.split('T')[0]}</td>
                                                <td><strong>₹{c.amount}</strong></td>
                                                <td>{getStatusBadge(c.status)}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </GlassCard>
                )}
            </div>

            {/* Premium Payment Modal */}
            {showPayModal && (
                <div className="modal-overlay">
                    <div className="payment-modal glass-premium animate-entry">
                        <button className="modal-close-btn" onClick={resetPayment}><XCircle size={24} /></button>

                        <div className="payment-steps">
                            <div className={`step-dot ${payStep >= 1 ? 'active' : ''}`}></div>
                            <div className={`step-dot ${payStep >= 2 ? 'active' : ''}`}></div>
                            <div className={`step-dot ${payStep >= 3 ? 'active' : ''}`}></div>
                        </div>

                        {payStep === 1 && (
                            <div className="pay-content">
                                <div className="step-header">
                                    <Smartphone size={32} color="var(--purple-glow)" />
                                    <h2>Send Money</h2>
                                    <p>Enter Recipient UPI ID</p>
                                </div>
                                <form onSubmit={handlePayment}>
                                    <div className="input-field">
                                        <Search className="field-icon" size={18} />
                                        <input
                                            type="text"
                                            placeholder="username@bank"
                                            value={payForm.upiId}
                                            onChange={e => setPayForm({ ...payForm, upiId: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="step-btn">Proceed <ArrowRight size={18} /></button>
                                </form>
                            </div>
                        )}

                        {payStep === 2 && (
                            <div className="pay-content">
                                <div className="step-header">
                                    <IndianRupee size={32} color="var(--purple-glow)" />
                                    <h2>Enter Amount</h2>
                                    <p>Paying to <strong>{payForm.upiId}</strong></p>
                                </div>
                                <form onSubmit={handlePayment}>
                                    <div className="input-field amount-input">
                                        <input
                                            type="number"
                                            placeholder="0.00"
                                            value={payForm.amount}
                                            onChange={e => setPayForm({ ...payForm, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="step-btn">Review Payment <ArrowRight size={18} /></button>
                                </form>
                            </div>
                        )}

                        {payStep === 3 && (
                            <div className="pay-content">
                                <div className="step-header">
                                    <Key size={32} color="var(--purple-glow)" />
                                    <h2>Enter UPI PIN</h2>
                                    <p>Confirm ₹{payForm.amount} to {payForm.upiId}</p>
                                </div>
                                <form onSubmit={handlePayment}>
                                    <div className="pin-grid">
                                        <input
                                            type="password"
                                            maxLength="1"
                                            className="pin-box"
                                            value={payForm.pin}
                                            onChange={e => setPayForm({ ...payForm, pin: e.target.value })}
                                            required
                                        />
                                        {[...Array(5)].map((_, i) => <div key={i} className="pin-box"></div>)}
                                    </div>
                                    <button type="submit" className="step-btn pay-confirm">Pay Securely <ShieldAlert size={18} /></button>
                                </form>
                            </div>
                        )}

                        {payStep === 4 && (
                            <div className="pay-content processing">
                                <div className="loader-wrap">
                                    <div className="processing-orb"></div>
                                    <Loader2 className="spin" size={48} />
                                </div>
                                <h2>Securing Payment...</h2>
                                <p>Verifying with NPCI Servers</p>
                            </div>
                        )}

                        {payStep === 5 && (
                            <div className="pay-content success">
                                <div className="success-icon-wrap">
                                    <svg viewBox="0 0 52 52" className="checkmark">
                                        <circle cx="26" cy="26" r="25" fill="none" className="checkmark-circle" />
                                        <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" className="checkmark-check" />
                                    </svg>
                                </div>
                                <h2>Payment Successful!</h2>
                                <div className="success-amount">₹{payForm.amount}</div>
                                <p>Sent to {payForm.upiId}</p>
                                <button className="step-btn success-btn" onClick={resetPayment}>Done</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Dispute Modal (Old) */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content glass-premium animate-entry">
                        <h2>File Dispute</h2>
                        <form onSubmit={submitComplaint}>
                            <input className="modal-input" placeholder="Transaction ID" value={form.transactionId} onChange={e => setForm({ ...form, transactionId: e.target.value })} required />
                            <input className="modal-input" placeholder="Amount" type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
                            <textarea className="modal-input" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
                            <button type="submit" className="step-btn">{submitting ? <Loader2 className="spin" /> : 'Submit'}</button>
                            <button type="button" className="close-btn" onClick={() => setShowModal(false)}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

            <style>{`
                .navbar { padding: 20px 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); }
                .nav-brand { display: flex; align-items: center; gap: 10px; font-weight: 900; font-size: 20px; font-family: var(--font-display); }
                .nav-brand-icon { width: 36px; height: 36px; background: var(--purple-glow); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .nav-right { display: flex; align-items: center; gap: 20px; }
                .nav-user { display: flex; align-items: center; gap: 10px; padding: 5px 15px; border: 1px solid var(--border); border-radius: 20px; background: var(--bg-surface); }
                .nav-avatar { width: 30px; height: 30px; border-radius: 50%; background: linear-gradient(135deg, #A855F7, #EC4899); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; }
                .logout-btn { background: none; border: none; color: var(--text-muted); cursor: pointer; }

                .main-content { padding: 40px 20px; max-width: 1000px; margin: 0 auto; }
                
                .balance-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 30px; margin-bottom: 40px; }
                .balance-card { padding: 35px; position: relative; display: flex; justify-content: space-between; align-items: center; }
                .balance-label { font-size: 13px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
                .balance-amount { font-size: 42px; font-weight: 900; font-family: var(--font-mono); display: flex; align-items: center; gap: 15px; }
                .balance-toggle { font-size: 12px; background: var(--bg-surface); border: 1px solid var(--border); padding: 4px 12px; border-radius: 10px; cursor: pointer; color: var(--text-secondary); }
                .balance-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(168,85,247,0.1); color: #A855F7; padding: 5px 12px; border-radius: 20px; font-size: 11px; font-weight: 800; margin-top: 15px; }
                
                .pay-btn { background: linear-gradient(135deg, #7C3AED, #EC4899); border: none; padding: 15px 30px; border-radius: 20px; color: white; font-weight: 800; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 10px 25px rgba(168,85,247,0.4); }
                .pay-icon { width: 44px; height: 44px; background: rgba(255,255,255,0.2); border-radius: 15px; display: flex; align-items: center; justify-content: center; }

                .quick-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                .action-card { background: var(--bg-surface); border: 1px solid var(--border); border-radius: 24px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; cursor: pointer; transition: all 0.3s; }
                .action-card:hover { border-color: var(--border-accent); transform: translateY(-5px); }
                .action-icon { width: 44px; height: 44px; background: var(--bg-elevated); border-radius: 15px; display: flex; align-items: center; justify-content: center; color: var(--purple-glow); }

                .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .stat-card { background: var(--bg-surface); padding: 25px; border-radius: 24px; border: 1px solid var(--border); }
                .stat-label { font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 5px; }
                .stat-val { font-size: 28px; font-weight: 900; font-family: var(--font-mono); }

                .history-card { padding: 30px; }
                .card-header { margin-bottom: 25px; }
                .card-title { display: flex; align-items: center; gap: 10px; font-size: 20px; font-weight: 800; }
                table { width: 100%; border-collapse: collapse; }
                th { text-align: left; padding: 15px; font-size: 11px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); }
                td { padding: 15px; font-size: 14px; border-bottom: 1px solid var(--border); }
                .id-cell code { background: rgba(168,85,247,0.1); color: #A855F7; padding: 4px 8px; border-radius: 6px; font-size: 12px; }

                .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(10px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .payment-modal { width: 100%; max-width: 400px; padding: 40px; position: relative; }
                .modal-close-btn { position: absolute; top: 20px; right: 20px; background: none; border: none; color: var(--text-muted); cursor: pointer; }
                
                .payment-steps { display: flex; justify-content: center; gap: 10px; margin-bottom: 30px; }
                .step-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all 0.3s; }
                .step-dot.active { background: #A855F7; width: 24px; border-radius: 4px; }

                .pay-content { text-align: center; }
                .step-header { margin-bottom: 30px; }
                .step-header h2 { font-size: 24px; font-weight: 800; margin-top: 15px; }
                .step-header p { color: var(--text-muted); font-size: 14px; margin-top: 5px; }

                .input-field { background: var(--input-bg); border: 1px solid var(--border); padding: 16px; border-radius: 18px; display: flex; align-items: center; gap: 12px; margin-bottom: 25px; }
                .input-field input { background: none; border: none; color: var(--text-primary); outline: none; width: 100%; font-size: 16px; font-weight: 600; }
                .amount-input input { font-size: 38px; text-align: center; font-family: var(--font-mono); }
                
                .step-btn { width: 100%; padding: 18px; border-radius: 18px; border: none; background: var(--text-primary); color: var(--bg-base); font-weight: 800; font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px; transition: all 0.3s; }
                .step-btn:hover { transform: scale(1.02); }
                .pay-confirm { background: linear-gradient(135deg, #7C3AED, #EC4899); color: white; margin-top: 20px; }

                .pin-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 30px; }
                .pin-box { aspect-ratio: 1; border: 2px solid var(--border); border-radius: 12px; display: flex; align-items: center; justify-content: center; background: var(--bg-surface); }
                .pin-box:first-child { border-color: var(--purple-glow); }

                .processing-orb { width: 80px; height: 80px; background: var(--purple-glow); filter: blur(40px); position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border-radius: 50%; z-index: -1; animation: pulse-gentle 2s infinite; }
                
                .success-icon-wrap { width: 100px; height: 100px; margin: 0 auto 30px; }
                .checkmark { width: 100px; height: 100px; border-radius: 50%; stroke-width: 2; stroke: #10B981; stroke-miterlimit: 10; box-shadow: inset 0 0 0 #10B981; animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both; }
                .checkmark-circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #10B981; fill: none; animation: stroke .6s cubic-bezier(.65,0,.45,1) forwards; }
                .checkmark-check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke .3s cubic-bezier(.65,0,.45,1) .8s forwards; }
                
                @keyframes stroke { 100% { stroke-dashoffset: 0; } }
                @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
                @keyframes fill { 100% { box-shadow: inset 0 0 0 50px rgba(16,185,129,0.1); } }
                
                .close-btn-small { background: none; border: none; color: var(--text-muted); cursor: pointer; transition: color 0.3s; }
                .close-btn-small:hover { color: var(--text-primary); }
                
                .animate-entry { animation: entry-rotate 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
            `}</style>
        </div>
    );
};

export default Dashboard;
