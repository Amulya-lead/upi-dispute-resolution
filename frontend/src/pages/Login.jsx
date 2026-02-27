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
        <div className="login-wrapper">
            <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 100 }}>
                <ThemeToggle />
            </div>

            <div className="logo-section">
                <div className="logo-icon-wrap">
                    <Zap size={36} color="var(--text-primary)" />
                </div>
                <div className="logo-title">UPI Rapid</div>
                <div className="logo-sub">Instant Payment Recovery Platform</div>
                <div className="logo-badge">
                    <ShieldHalf size={12} />
                    NPCI Compliant &nbsp;·&nbsp; 24/7 Protected
                </div>
            </div>

            <GlassCard highlightColor="var(--purple-glow)">
                <div className="section-title">
                    <div className="title-icon"><User size={18} /></div>
                    User Login
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
                                placeholder="John Doe"
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
                                placeholder="your@email.com"
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
                            <label htmlFor="rememberMe">Remember me</label>
                        </div>
                        <a href="#" onClick={(e) => e.preventDefault()} className="forgot-link">Forgot Password?</a>
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? <Loader2 className="spin" size={18} /> : <ArrowRightToBracket size={18} />}
                        &nbsp;{loading ? 'Authenticating...' : 'Login to Dashboard'}
                    </button>
                </form>

                <div className="divider">
                    <div className="divider-line"></div>
                    <div className="divider-text">New here?</div>
                    <div className="divider-line"></div>
                </div>

                <div className="register-wrap">
                    Don't have an account? <a href="#" onClick={handleRegister} className="register-link">Create one now <ArrowRight size={12} style={{ display: 'inline', marginLeft: '4px' }} /></a>
                </div>

                <div className="features-strip">
                    <div className="feature-pill"><Zap size={10} /> Instant Resolution</div>
                    <div className="feature-pill"><ShieldHalf size={10} /> Bank-Grade Security</div>
                    <div className="feature-pill"><Clock size={10} /> 24/7 Support</div>
                </div>
            </GlassCard>

            <div className="admin-link-wrap">
                <button onClick={() => navigate('/admin-login')} className="admin-link">
                    <ShieldHalf size={14} />
                    Admin / Manager Portal
                    <ArrowRight size={10} style={{ marginLeft: '4px' }} />
                </button>
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

        /* ── Logo ── */
        .logo-section { text-align: center; margin-bottom: 36px; }

        .logo-icon-wrap {
            display: inline-flex; align-items: center; justify-content: center;
            width: 90px; height: 90px; border-radius: 28px;
            background: linear-gradient(135deg, var(--purple-glow), var(--pink-glow));
            border: 1.5px solid var(--border-accent);
            margin-bottom: 22px;
            animation: logoPulse 3s ease-in-out infinite;
            box-shadow: 0 0 60px var(--purple-glow), 0 0 120px rgba(168,85,247,0.25), inset 0 1px 0 rgba(255,255,255,0.2);
        }
        @keyframes logoPulse {
            0%, 100% { box-shadow: 0 0 60px var(--purple-glow), 0 0 120px rgba(168,85,247,0.2), inset 0 1px 0 rgba(255,255,255,0.2); }
            50%      { box-shadow: 0 0 90px var(--pink-glow), 0 0 180px rgba(168,85,247,0.35), inset 0 1px 0 rgba(255,255,255,0.25); }
        }

        .logo-title {
            font-family: 'Playfair Display', serif;
            font-size: 44px; font-weight: 800;
            background: linear-gradient(135deg, var(--text-primary) 0%, #F0ABFC 30%, #A855F7 60%, #F9A8D4 100%);
            -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
            letter-spacing: -0.5px; line-height: 1.1; margin-bottom: 8px;
            filter: drop-shadow(0 0 24px var(--purple-glow));
        }
        .logo-sub { color: var(--text-secondary); font-size: 13px; font-weight: 400; letter-spacing: 0.5px; }

        .logo-badge {
            display: inline-flex; align-items: center; gap: 6px;
            background: rgba(251,191,36,0.18); border: 1px solid rgba(251,191,36,0.45);
            border-radius: 20px; padding: 5px 16px;
            font-size: 11px; color: #FDE68A; font-weight: 700; letter-spacing: 0.5px; margin-top: 12px;
            box-shadow: 0 0 18px rgba(251,191,36,0.22);
        }

        /* ── Section Title ── */
        .section-title {
            font-size: 22px; font-weight: 700; color: var(--text-primary);
            margin-bottom: 28px; display: flex; align-items: center; gap: 10px;
        }
        .title-icon {
            width: 38px; height: 38px;
            background: linear-gradient(135deg, var(--purple-glow), var(--pink-glow));
            border-radius: 11px; display: flex; align-items: center; justify-content: center;
            color: var(--text-primary);
            border: 1px solid var(--border-accent);
            box-shadow: 0 0 18px var(--purple-glow);
        }

        /* ── Alerts ── */
        .alert { display: flex; align-items: center; gap: 12px; padding: 14px 18px; border-radius: 14px; margin-bottom: 22px; font-size: 13px; font-weight: 500; animation: alertSlide 0.3s ease both; }
        @keyframes alertSlide { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .alert-success { background: rgba(16,185,129,0.14); border: 1px solid rgba(16,185,129,0.35); color: #6EE7B7; }
        .alert-error   { background: rgba(239,68,68,0.12);  border: 1px solid rgba(239,68,68,0.3);  color: var(--red-vivid); }

        /* ── Form ── */
        .form-group { margin-bottom: 20px; text-align: left; }
        .form-label { display: block; font-size: 12px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 9px; }
        .input-wrap { position: relative; }
        .input-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); transition: color 0.3s; pointer-events: none; }
        
        .form-input {
            width: 100%; padding: 14px 16px 14px 46px;
            background: var(--input-bg); border: 1.5px solid var(--border);
            border-radius: 14px; font-size: 14px; color: var(--text-primary);
            font-family: 'Poppins', sans-serif; transition: all 0.3s ease; outline: none;
        }
        .form-input::placeholder { color: var(--text-muted); }
        .form-input:focus {
            border-color: var(--border-accent);
            background: var(--bg-surface);
            box-shadow: 0 0 0 4px var(--card-glow), 0 0 28px var(--card-glow);
        }
        .form-input:focus ~ .input-icon { color: var(--text-primary); }

        .form-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .remember-wrap { display: flex; align-items: center; gap: 8px; }
        .remember-wrap input[type="checkbox"] { width: 16px; height: 16px; accent-color: #A855F7; cursor: pointer; }
        .remember-wrap label { font-size: 13px; color: var(--text-muted); cursor: pointer; }
        .forgot-link { font-size: 12px; color: var(--text-secondary); text-decoration: none; font-weight: 700; transition: all 0.2s; }
        .forgot-link:hover { color: var(--text-primary); text-shadow: 0 0 12px var(--border-accent); }

        /* ── Button ── */
        .submit-btn {
            width: 100%; padding: 16px;
            background: linear-gradient(135deg, #7C3AED 0%, #A855F7 40%, #EC4899 100%);
            color: white; border: none; border-radius: 14px;
            font-weight: 800; font-size: 15px; cursor: pointer;
            transition: all 0.3s ease; display: inline-flex; align-items: center; justify-content: center;
            position: relative; overflow: hidden; letter-spacing: 0.3px;
            box-shadow: 0 8px 36px rgba(168,85,247,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset;
        }
        .submit-btn::before {
            content: ''; position: absolute; top: 0; left: -100%; width: 100%; height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            transition: left 0.5s ease;
        }
        .submit-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 50px rgba(168,85,247,0.7), 0 0 60px rgba(236,72,153,0.25), 0 0 0 1px rgba(255,255,255,0.2) inset; }
        .submit-btn:hover::before { left: 100%; }
        .submit-btn:active { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; box-shadow: none; }
        
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }

        /* ── Divider ── */
        .divider { display: flex; align-items: center; gap: 12px; margin: 22px 0; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 12px; color: var(--text-muted); font-weight: 500; }

        /* ── Register / Admin ── */
        .register-wrap { text-align: center; font-size: 13px; color: var(--text-muted); margin-top: 18px; }
        .register-link { color: var(--text-primary); text-decoration: none; font-weight: 800; transition: all 0.2s; }
        .register-link:hover { color: #A855F7; text-shadow: 0 0 14px var(--border-accent); }

        .admin-link-wrap { text-align: center; margin-top: 22px; }
        .admin-link {
            display: inline-flex; align-items: center; gap: 8px;
            color: var(--text-muted); font-size: 12px; font-weight: 600; cursor: pointer;
            padding: 10px 22px; border: 1px solid var(--border);
            border-radius: 30px; background: var(--bg-surface);
            transition: all 0.3s; backdrop-filter: blur(10px);
        }
        .admin-link:hover { color: var(--text-primary); border-color: var(--border-accent); background: var(--bg-elevated); box-shadow: 0 4px 12px var(--card-glow); }

        /* ── Feature Pills ── */
        .features-strip { display: flex; gap: 8px; margin-top: 24px; flex-wrap: wrap; justify-content: center; }
        .feature-pill {
            display: inline-flex; align-items: center; gap: 5px;
            padding: 6px 13px;
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 20px; font-size: 11px; color: var(--text-secondary); font-weight: 600;
        }
        .feature-pill svg { color: var(--text-primary); }
      `}</style>
        </div>
    );
};

export default Login;
