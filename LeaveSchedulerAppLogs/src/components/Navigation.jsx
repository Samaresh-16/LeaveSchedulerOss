// filepath: src/components/Navigation.js
import {
    Activity,
    BarChart3,
    FileText,
    Menu,
    Shield,
    TrendingUp,
    X,
    Zap
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { path: '/logs', label: 'Logs Viewer', icon: FileText },
    { path: '/statistics', label: 'Statistics', icon: TrendingUp },
    { path: '/performance', label: 'Performance', icon: Zap },
    { path: '/security', label: 'Security', icon: Shield }
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button 
        className="mobile-menu-toggle" 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      <nav className={`navigation ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="nav-brand">
          <Activity className="nav-brand-icon" size={24} />
          <span className="nav-brand-text">Leave Scheduler: Logs and Metrics</span>
        </div>
        <ul className="nav-menu">
          {navItems.map(({ path, label, icon: Icon }) => (
            <li key={path} className="nav-item">
              <Link 
                to={path} 
                className={`nav-link ${location.pathname === path ? 'active' : ''}`}
                onClick={handleLinkClick}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      {isMobileMenuOpen && (
        <div 
          className="mobile-overlay" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;