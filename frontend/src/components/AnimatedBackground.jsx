import React from 'react';
import { useLocation } from 'react-router-dom';

const AnimatedBackground = () => {
  const location = useLocation();
  const isAdmin = location.pathname.includes('admin');

  return (
    <>
      <div className="bg-fixed"></div>
      
      {/* Shared Orbs - Styles dynamically controlled by CSS variables based on theme */}
      <div className="orb orb-1"></div>
      <div className="orb orb-2"></div>
      <div className="orb orb-3"></div>
      {!isAdmin && <div className="orb orb-4"></div>}

      {/* Admin specific background additions */}
      {isAdmin && <div className="grid-lines"></div>}
      
      {/* User Login specific background additions */}
      {!isAdmin && <div className="stars"></div>}

      <style>{`
        .bg-fixed {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          transition: var(--transition);
        }
        
        [data-theme="dark"] .bg-fixed {
          background: ${isAdmin ? `
            radial-gradient(ellipse at 8% 20%, rgba(120,10,10,0.55) 0%, transparent 50%),
            radial-gradient(ellipse at 88% 75%, rgba(90,5,5,0.45) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(60,2,2,0.4) 0%, transparent 40%),
            linear-gradient(160deg, #08010a 0%, #160303 55%, #0c0101 100%)
          ` : `
            radial-gradient(ellipse at 20% 50%, #5b0fa8 0%, transparent 55%),
            radial-gradient(ellipse at 80% 20%, #1e106b 0%, transparent 50%),
            radial-gradient(ellipse at 55% 90%, #72037a 0%, transparent 50%),
            linear-gradient(135deg, #06000f 0%, #0e0926 50%, #1a0338 100%)
          `};
        }

        [data-theme="light"] .bg-fixed {
          background: ${isAdmin ? `
            radial-gradient(ellipse at 8% 20%, rgba(254,202,202,0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 88% 75%, rgba(253,164,175,0.5) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 100%, rgba(254,215,170,0.4) 0%, transparent 40%),
            linear-gradient(160deg, #FFF5F5 0%, #FEF2F2 55%, #FFFBEB 100%)
          ` : `
            radial-gradient(ellipse at 20% 50%, rgba(216,180,254,0.6) 0%, transparent 55%),
            radial-gradient(ellipse at 80% 20%, rgba(191,219,254,0.6) 0%, transparent 50%),
            radial-gradient(ellipse at 55% 90%, rgba(24bc,165,165,0.5) 0%, transparent 50%),
            linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)
          `};
        }

        .orb {
          position: fixed; border-radius: 50%;
          animation: orbFloat linear infinite;
          z-index: 0; pointer-events: none; transition: background 0.5s;
        }

        .orb-1 { 
          width: 700px; height: 700px; top: -250px; left: -250px; animation-duration: 22s;
          background: radial-gradient(circle, var(--orb-1) 0%, transparent 70%); filter: blur(90px); 
        }
        .orb-2 { 
          width: 500px; height: 500px; bottom: -200px; right: -200px; animation-duration: 28s; animation-delay: -12s;
          background: radial-gradient(circle, var(--orb-2) 0%, transparent 70%); filter: blur(80px); 
        }
        .orb-3 { 
          width: 350px; height: 350px; top: 30%; left: 60%; animation-duration: 20s; animation-delay: -6s;
          background: radial-gradient(circle, var(--orb-3) 0%, transparent 70%); filter: blur(70px); 
        }
        .orb-4 { 
          width: 300px; height: 300px; top: 15%; right: 25%; animation-duration: 22s; animation-delay: -8s;
          background: radial-gradient(circle, rgba(251,191,36,0.3) 0%, transparent 70%); filter: blur(65px); 
        }

        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          25%  { transform: translate(30px,-40px) scale(1.04); }
          50%  { transform: translate(-25px,30px) scale(0.96); }
          75%  { transform: translate(38px,18px) scale(1.02); }
        }

        .grid-lines {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; transition: opacity 0.4s;
        }
        [data-theme="dark"] .grid-lines {
          background-image:
              linear-gradient(rgba(239,68,68,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(239,68,68,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
          opacity: 1;
        }
        [data-theme="light"] .grid-lines { opacity: 0; }

        .stars {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image:
              radial-gradient(1.5px 1.5px at 10% 15%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 30% 60%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(2px 2px at 55% 25%, rgba(240,171,252,0.8) 0%, transparent 100%),
              radial-gradient(1px 1px at 75% 70%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 85% 10%, rgba(255,255,255,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 20% 85%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(2px 2px at 65% 80%, rgba(251,191,36,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 92% 45%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(2.5px 2.5px at 40% 40%, rgba(216,180,254,0.9) 0%, transparent 100%),
              radial-gradient(1px 1px at 5% 50%, rgba(255,255,255,0.4) 0%, transparent 100%);
        }
      `}</style>
    </>
  );
};

export default AnimatedBackground;
