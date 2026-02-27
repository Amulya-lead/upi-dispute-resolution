import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, User, Lock, KeyRound, Loader2, ArrowRightToBracket, AlertTriangle, ArrowLeft } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ThemeToggle from '../components/ThemeToggle';

const API = 'http://localhost:5000';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({ username: '', password: '', secret_key: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/admin/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem('userRole', data.role);
                sessionStorage.setItem('userName', data.username);
                sessionStorage.setItem('token', data.token);

                navigate('/admin-dashboard');
            } else {
                setError(data.message || 'Access Denied');
            }
        } catch {
            setError('Connection failed. Server offline.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper admin-theme">
            <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 100 }}>
                <ThemeToggle />
            </div>

            <div className="logo-section">
                <div className="admin-icon-glow">
                    <ShieldAlert size={48} color="var(--red-vivid)" />
                </div>
                <div className="logo-title admin-title">Restricted Access</div>
                <div className="logo-sub">UPI Command Center Portal</div>
            </div>

            <GlassCard highlightColor="var(--red-vivid)" className="admin-card">
                <div className="auth-badge">
                    <Lock size={12} />
                    3-Factor Authentication Required
                </div>

                {error && (
                    <div className="alert alert-error">
                        <AlertTriangle size={18} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Admin ID</label>
                        <div className="input-wrap">
                            <User className="input-icon" size={16} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="system_admin"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Master Password</label>
                        <div className="input-wrap">
                            <Lock className="input-icon" size={16} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Encryption Key</label>
                        <div className="input-wrap">
                            <KeyRound className="input-icon" size={16} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Enter 16-bit key"
                                value={formData.secret_key}
                                onChange={(e) => setFormData({ ...formData, secret_key: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="submit-btn admin-btn" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={18} /> : <ArrowRightToBracket size={18} />}
                        &nbsp;{loading ? 'Verifying Credentials...' : 'Authorize Access'}
                    </button>
                </form>

            </GlassCard>

            <div className="back-link-wrap">
                <button onClick={() => navigate('/')} className="back-link">
                    <ArrowLeft size={14} /> Return to Public Portal
                </button>
            </div>

            <div className="security-notice">
                <ShieldAlert size={16} />
                <div>
                    <strong>UNAUTHORIZED ACCESS PROHIBITED</strong>
                    <p>This system is monitored. All login attempts are recorded with IP tracking.</p>
                </div>
            </div>

            <style>{`
        .login-wrapper {
            position: relative; z-index: 10;
            width: 100%; max-width: 480px; margin: 0 auto;
            animation: fadeSlideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes fadeSlideUp {
            from { opacity: 0; transform: translateY(40px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .logo-section { text-align: center; margin-bottom: 32px; }

        .admin-icon-glow {
            display: inline-flex; align-items: center; justify-content: center;
            width: 100px; height: 100px; border-radius: 20px;
            background: rgba(220,38,38,0.1);
            border: 1.5px solid rgba(239,68,68,0.3);
            margin-bottom: 24px;
            box-shadow: 0 0 60px rgba(220,38,38,0.4), inset 0 0 20px rgba(239,68,68,0.2);
            animation: pulse-danger 3s infinite;
        }
        @keyframes pulse-danger {
            0%, 100% { box-shadow: 0 0 50px rgba(220,38,38,0.4), inset 0 0 15px rgba(239,68,68,0.2); }
            50% { box-shadow: 0 0 80px rgba(239,68,68,0.6), inset 0 0 25px rgba(239,68,68,0.3); }
        }

        .admin-title {
            font-family: 'Space Mono', monospace; font-size: 32px; font-weight: 800;
            background: linear-gradient(135deg, #fff 0%, #EF4444 60%, #991B1B 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            text-transform: uppercase; letter-spacing: -1px; margin-bottom: 8px;
            filter: drop-shadow(0 0 16px rgba(239,68,68,0.4));
        }

        .logo-sub { color: var(--text-muted); font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; }

        .auth-badge {
            display: inline-flex; align-items: center; gap: 8px;
            padding: 8px 16px; background: rgba(239,68,68,0.15);
            border: 1px dashed rgba(239,68,68,0.4); border-radius: 12px;
            font-family: 'Space Mono', monospace; font-size: 11px;
            color: #FCA5A5; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.5px; margin-bottom: 24px; width: 100%; justify-content: center;
        }

        .alert { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; margin-bottom: 22px; font-size: 13px; font-weight: 500; animation: alertSlide 0.3s ease both; }
        @keyframes alertSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .alert-error   { background: rgba(239,68,68,0.15);  border: 1px solid rgba(239,68,68,0.4);  color: #FCA5A5; }

        .form-group { margin-bottom: 22px; text-align: left; }
        .form-label { display: block; font-family: 'Space Mono', monospace; font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 9px; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: color 0.3s; pointer-events: none; }
        
        .form-input {
            width: 100%; padding: 15px 16px 15px 46px;
            background: rgba(0,0,0,0.3); border: 1.5px solid rgba(239,68,68,0.3);
            border-radius: 14px; font-size: 14px; color: white;
            font-family: 'Space Mono', monospace; transition: all 0.3s ease; outline: none;
        }
        [data-theme="light"] .form-input { background: white; color: black; border: 1.5px solid rgba(220,38,38,0.4); }

        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus {
            border-color: var(--red-vivid); background: rgba(239,68,68,0.05);
            box-shadow: 0 0 0 4px rgba(239,68,68,0.15), 0 0 20px rgba(239,68,68,0.2);
        }
        [data-theme="light"] .form-input:focus { background: white; box-shadow: 0 0 0 4px rgba(220,38,38,0.2); }
        .form-input:focus ~ .input-icon { color: var(--red-vivid); }

        .admin-btn {
            background: linear-gradient(135deg, #991B1B, #EF4444, #F97316);
            box-shadow: 0 8px 30px rgba(239,68,68,0.4), 0 0 0 1px rgba(255,255,255,0.2) inset;
            width: 100%; padding: 16px; color: white; border: none; border-radius: 14px;
            font-weight: 800; font-size: 15px; cursor: pointer; display: inline-flex;
            align-items: center; justify-content: center; transition: all 0.3s ease;
        }
        .admin-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(239,68,68,0.6), 0 0 0 1px rgba(255,255,255,0.3) inset; }
        .admin-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        .back-link-wrap { text-align: center; margin-top: 24px; }
        .back-link {
            display: inline-flex; align-items: center; gap: 8px;
            color: var(--text-muted); font-size: 13px; font-weight: 600; cursor: pointer;
            padding: 10px 24px; border: 1px solid var(--border);
            border-radius: 30px; background: var(--bg-surface);
            transition: all 0.3s; backdrop-filter: blur(10px);
        }
        .back-link:hover { color: var(--text-primary); border-color: rgba(255,255,255,0.3); background: rgba(255,255,255,0.05); transform: translateX(-4px); }
        [data-theme="light"] .back-link:hover { background: white; border-color: #666; }

        .security-notice {
            margin-top: 32px; padding: 20px; border-radius: 16px;
            background: rgba(153,27,27,0.1); border: 1px solid rgba(220,38,38,0.2);
            display: flex; gap: 14px; align-items: flex-start;
            color: #FCA5A5; font-size: 11px; line-height: 1.5; font-family: 'Space Mono', monospace;
        }
        [data-theme="light"] .security-notice { background: rgba(254,202,202,0.4); color: #991B1B; }

        .security-notice strong { color: #EF4444; display: block; margin-bottom: 4px; font-size: 12px; }
      `}</style>
        </div>
    );
};

export default AdminLogin;
