import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Zap, ShieldHalf, Clock, ArrowRight, Loader2, ArrowRightToBracket, AlertCircle, CheckCircle } from 'lucide-react';
import GlassCard from '../components/GlassCard';
import ThemeToggle from '../components/ThemeToggle';

const API = 'http://localhost:5000';

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({ name: '', email: '', password: '' });

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();

            if (data.success) {
                sessionStorage.setItem('userRole', 'user');
                sessionStorage.setItem('userName', data.name);
                sessionStorage.setItem('userEmail', data.email);
                sessionStorage.setItem('token', data.token);

                setSuccess('Login successful! Redirecting...');
                setTimeout(() => navigate('/dashboard'), 1200);
            } else {
                setError(data.message || 'Invalid email or password');
            }
        } catch (err) {
            setError('Cannot connect to server. Make sure Flask is running.');
        } finally {
            if (!success) setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        const name = prompt('Full Name:'); if (!name) return;
        const email = prompt('Email:'); if (!email) return;
        const password = prompt('Password:'); if (!password) return;

        try {
            const res = await fetch(`${API}/api/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json();
            alert(data.message);
            if (data.success) {
                setFormData({ ...formData, email, name });
            }
        } catch {
            alert('Server not running. Start Flask first.');
        }
    };

    return (
        <div className="login-wrapper animate-entry">
            <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 100 }}>
                <ThemeToggle />
            </div>

            <div className="logo-section animate-float">
                <div className="logo-icon-wrap">
                    <Zap size={36} fill="white" color="white" />
                </div>
                <div className="logo-title">UPI Rapid</div>
                <div className="logo-sub">Seamless. Secure. Stylish.</div>
                <div className="logo-badge">
                    <ShieldHalf size={12} />
                    Bank-Grade Encryption &nbsp;·&nbsp; 24/7 Verified
                </div>
            </div>

            <GlassCard highlightColor="var(--purple-glow)" className="glass-premium">
                <div className="section-title">
                    <div className="title-icon"><User size={18} /></div>
                    Welcome Back
                </div>

                {success && (
                    <div className="alert alert-success">
                        <CheckCircle size={16} />
                        <span>{success}</span>
                    </div>
                )}

                {error && (
                    <div className="alert alert-error">
                        <AlertCircle size={16} />
                        <span>{error}</span>
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <div className="input-wrap">
                            <User className="input-icon" size={16} />
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Enter your name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrap">
                            <Mail className="input-icon" size={16} />
                            <input
                                type="email"
                                className="form-input"
                                placeholder="name@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrap">
                            <Lock className="input-icon" size={16} />
                            <input
                                type="password"
                                className="form-input"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="remember-wrap">
                            <input type="checkbox" id="rememberMe" />
                            <label htmlFor="rememberMe">Stay logged in</label>
                        </div>
                        <a href="#" onClick={(e) => e.preventDefault()} className="forgot-link">Forgot?</a>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={18} /> : <ArrowRightToBracket size={18} />}
                        &nbsp;{loading ? 'Authenticating...' : 'Enter Dashboard'}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <div className="divider-text">OR</div>
                    <div className="divider-line"></div>
                </div>

                <div className="register-wrap">
                    Need an account? <a href="#" onClick={handleRegister} className="register-link">Sign up <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} /></a>
                </div>

                <div className="features-strip">
                    <div className="feature-pill"><Zap size={10} /> Instant</div>
                    <div className="feature-pill"><ShieldHalf size={10} /> Secure</div>
                    <div className="feature-pill"><Clock size={10} /> 24/7</div>
                </div>
            </GlassCard>

            <div className="admin-link-wrap">
                <button onClick={() => navigate('/admin-login')} className="admin-link">
                    <ShieldHalf size={14} />
                    Management Portal
                    <ArrowRight size={10} style={{ marginLeft: '4px' }} />
                </button>
            </div>

            <style>{`
        .login-wrapper {
            position: relative; z-index: 10;
            width: 100%; max-width: 440px; margin: 0 auto;
            padding: 40px 20px;
        }

        /* ── Logo ── */
        .logo-section { text-align: center; margin-bottom: 40px; }

        .logo-icon-wrap {
            display: inline-flex; align-items: center; justify-content: center;
            width: 80px; height: 80px; border-radius: 24px;
            background: linear-gradient(135deg, var(--purple-glow), var(--pink-glow));
            border: 1px solid var(--border-accent);
            margin-bottom: 20px;
            box-shadow: 0 20px 40px var(--card-glow), inset 0 1px 1px rgba(255,255,255,0.2);
        }

        .logo-title {
            font-family: var(--font-display);
            font-size: 48px; font-weight: 900;
            background: linear-gradient(135deg, #FFF 0%, #F0ABFC 30%, #A855F7 60%, #F9A8D4 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
            letter-spacing: -1px; line-height: 1; margin-bottom: 8px;
            filter: drop-shadow(0 0 20px var(--purple-glow));
        }
        .logo-sub { color: var(--text-secondary); font-size: 14px; font-weight: 500; letter-spacing: 1px; text-transform: uppercase; opacity: 0.8; }

        .logo-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(251,191,36,0.1); border: 1px solid rgba(251,191,36,0.3);
            border-radius: 20px; padding: 6px 16px;
            font-size: 11px; color: var(--accent-gold); font-weight: 700; margin-top: 16px;
        }

        /* ── Section Title ── */
        .section-title {
            font-size: 24px; font-weight: 800; color: var(--text-primary);
            margin-bottom: 32px; display: flex; align-items: center; gap: 12px;
        }
        .title-icon {
            width: 40px; height: 40px;
            background: var(--bg-elevated);
            border-radius: 12px; display: flex; align-items: center; justify-content: center;
            color: var(--text-primary);
            border: 1px solid var(--border);
        }

        /* ── Alerts ── */
        .alert { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 16px; margin-bottom: 24px; font-size: 14px; font-weight: 600; }
        .alert-success { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.2); color: var(--accent-green); }
        .alert-error   { background: rgba(239,68,68,0.1);  border: 1px solid rgba(239,68,68,0.2);  color: #F87171; }

        /* ── Form ── */
        .form-group { margin-bottom: 24px; text-align: left; }
        .form-label { display: block; font-size: 11px; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: color 0.3s; pointer-events: none; }
        
        .form-input {
            width: 100%; padding: 16px 16px 16px 52px;
            background: var(--input-bg); border: 1px solid var(--border);
            border-radius: 16px; font-size: 15px; color: var(--text-primary);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); outline: none;
        }
        .form-input:focus {
            border-color: var(--border-accent);
            background: var(--bg-elevated);
            box-shadow: 0 0 0 4px rgba(168,85,247,0.15);
        }
        .form-input:focus ~ .input-icon { color: var(--text-primary); }

        .form-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 30px; }
        .remember-wrap { display: flex; align-items: center; gap: 10px; }
        .remember-wrap input[type="checkbox"] { width: 18px; height: 18px; accent-color: #A855F7; cursor: pointer; border-radius: 6px; }
        .remember-wrap label { font-size: 14px; color: var(--text-secondary); cursor: pointer; font-weight: 500; }
        .forgot-link { font-size: 13px; color: var(--text-muted); text-decoration: none; font-weight: 600; transition: all 0.2s; }
        .forgot-link:hover { color: var(--text-primary); }

        /* ── Button ── */
        .submit-btn {
            width: 100%; padding: 18px;
            background: linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%);
            color: white; border: none; border-radius: 18px;
            font-weight: 800; font-size: 16px; cursor: pointer;
            transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1); display: inline-flex; align-items: center; justify-content: center;
            box-shadow: 0 10px 30px rgba(168,85,247,0.4);
        }
        .submit-btn:hover { transform: translateY(-3px) scale(1.01); box-shadow: 0 20px 40px rgba(168,85,247,0.5); }
        .submit-btn:active { transform: translateY(-1px); }
        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ── Divider ── */
        .divider { display: flex; align-items: center; gap: 15px; margin: 30px 0; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 12px; color: var(--text-muted); font-weight: 700; letter-spacing: 1px; }

        /* ── Register / Admin ── */
        .register-wrap { text-align: center; font-size: 14px; color: var(--text-secondary); margin-top: 20px; font-weight: 500; }
        .register-link { color: var(--text-primary); text-decoration: none; font-weight: 800; transition: all 0.2s; border-bottom: 2px solid var(--border-accent); }
        .register-link:hover { border-color: #A855F7; }

        .admin-link-wrap { text-align: center; margin-top: 32px; }
        .admin-link {
            display: inline-flex; align-items: center; gap: 8px;
            color: var(--text-muted); font-size: 13px; font-weight: 700; cursor: pointer;
            padding: 12px 24px; border: 1px solid var(--border);
            border-radius: 30px; background: var(--bg-surface);
            transition: all 0.3s; backdrop-filter: blur(10px);
        }
        .admin-link:hover { color: var(--text-primary); border-color: var(--border-accent); background: var(--bg-elevated); }

        /* ── Feature Pills ── */
        .features-strip { display: flex; gap: 10px; margin-top: 32px; flex-wrap: wrap; justify-content: center; }
        .feature-pill {
            display: inline-flex; align-items: center; gap: 6px;
            padding: 8px 16px;
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 20px; font-size: 12px; color: var(--text-secondary); font-weight: 700;
        }
        .feature-pill svg { color: #A855F7; }
      `}</style>
        </div>
    );
};

export default Login;
