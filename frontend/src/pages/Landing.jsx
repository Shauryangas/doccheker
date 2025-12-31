import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "100vh" }}
      >
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--bg-primary)" }}>
      {/* Navigation */}
      <nav
        className="glass"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderBottom: "1px solid var(--border-light)",
        }}
      >
        <div
          className="container flex items-center justify-between"
          style={{ padding: "1rem 1.5rem" }}
        >
          <div className="flex items-center gap-md">
            <i
              className="bi bi-shield-check"
              style={{ fontSize: "1.75rem", color: "var(--text-primary)" }}
            ></i>
            <span
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                color: "var(--text-primary)",
              }}
            >
              LegalVault
            </span>
          </div>
          <div className="flex items-center gap-md">
            <button
              onClick={() => navigate("/login")}
              className="btn btn-secondary btn-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate("/signup")}
              className="btn btn-primary btn-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Grid Background */}
        <div
          className="grid-pattern"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.4,
          }}
        ></div>

        {/* Gradient Orbs */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "10%",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(14, 165, 233, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        ></div>
        <div
          style={{
            position: "absolute",
            bottom: "20%",
            right: "10%",
            width: "400px",
            height: "400px",
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
            borderRadius: "50%",
            filter: "blur(60px)",
          }}
        ></div>

        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}
          >
            {/* Badge */}
            <div className="fade-in" style={{ marginBottom: "2rem" }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.5rem 1rem",
                  background: "var(--bg-secondary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "var(--radius-full)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    background: "var(--success-500)",
                    borderRadius: "50%",
                    animation: "pulse 2s infinite",
                  }}
                ></span>
                Trusted by legal professionals worldwide
              </span>
            </div>

            {/* Main Headline */}
            <h1
              className="fade-in"
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4.5rem)",
                fontWeight: 800,
                marginBottom: "1.5rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                animationDelay: "0.1s",
              }}
            >
              Manage Your Legal Cases
              <br />
              <span className="gradient-text">Effortlessly & Securely</span>
            </h1>

            {/* Subheadline */}
            <p
              className="fade-in"
              style={{
                fontSize: "clamp(1.125rem, 2vw, 1.375rem)",
                color: "var(--text-secondary)",
                maxWidth: "700px",
                margin: "0 auto 3rem",
                lineHeight: 1.6,
                animationDelay: "0.2s",
              }}
            >
              The all-in-one platform for lawyers to organize cases, store
              documents securely, take notes, and prepare speeches. Everything
              you need in one place.
            </p>

            {/* CTA Buttons */}
            <div
              className="fade-in flex gap-md justify-center"
              style={{
                animationDelay: "0.3s",
                flexWrap: "wrap",
                marginBottom: "4rem",
              }}
            >
              <button
                onClick={() => navigate("/signup")}
                className="btn btn-gradient btn-xl"
              >
                <i className="bi bi-rocket-takeoff"></i>
                Start Free Trial
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-secondary btn-xl"
              >
                <i className="bi bi-play-circle"></i>
                Watch Demo
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className="fade-in"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "2rem",
                flexWrap: "wrap",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
                animationDelay: "0.4s",
              }}
            >
              <div className="flex items-center gap-sm">
                <i
                  className="bi bi-shield-check"
                  style={{ color: "var(--success-500)" }}
                ></i>
                <span style={{ color: "var(--text-secondary)" }}>
                  Bank-level Security
                </span>
              </div>
              <div className="flex items-center gap-sm">
                <i
                  className="bi bi-clock"
                  style={{ color: "var(--success-500)" }}
                ></i>
                <span style={{ color: "var(--text-secondary)" }}>
                  24/7 Access
                </span>
              </div>
              <div className="flex items-center gap-sm">
                <i
                  className="bi bi-cloud-check"
                  style={{ color: "var(--success-500)" }}
                ></i>
                <span style={{ color: "var(--text-secondary)" }}>
                  Cloud Storage
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div
            style={{
              textAlign: "center",
              marginBottom: "4rem",
              maxWidth: "700px",
              margin: "0 auto 4rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                marginBottom: "1rem",
              }}
            >
              Everything you need to succeed
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}>
              Powerful features designed for modern legal professionals
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                icon: "bi-folder-check",
                title: "Case Management",
                description:
                  "Organize and track all your cases in one centralized dashboard. Never lose track of important deadlines or client information.",
              },
              {
                icon: "bi-cloud-upload",
                title: "Secure Document Storage",
                description:
                  "Upload and manage all case documents with military-grade encryption. Access files from anywhere, anytime.",
              },
              {
                icon: "bi-journal-text",
                title: "Smart Note Taking",
                description:
                  "Create detailed case notes with rich formatting. Search and organize notes effortlessly.",
              },
              {
                icon: "bi-megaphone",
                title: "Speech Preparation",
                description:
                  "Write and organize opening statements, closing arguments, and legal speeches all in one place.",
              },
              {
                icon: "bi-search",
                title: "Powerful Search",
                description:
                  "Find any case, document, or note instantly with advanced search and filtering capabilities.",
              },
              {
                icon: "bi-shield-lock",
                title: "Enterprise Security",
                description:
                  "Your data is protected with bank-level encryption and regular security audits.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="card card-interactive scale-in"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  padding: "2rem",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "var(--radius-lg)",
                    background: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <i
                    className={`bi ${feature.icon}`}
                    style={{ fontSize: "1.75rem", color: "white" }}
                  ></i>
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    marginBottom: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  style={{
                    color: "var(--text-secondary)",
                    margin: 0,
                    lineHeight: 1.6,
                  }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container">
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                marginBottom: "1rem",
              }}
            >
              Get started in minutes
            </h2>
            <p style={{ fontSize: "1.125rem", color: "var(--text-secondary)" }}>
              Simple setup, powerful results
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "3rem",
              maxWidth: "1000px",
              margin: "0 auto",
            }}
          >
            {[
              {
                step: "01",
                title: "Create Account",
                description:
                  "Sign up with your email in seconds. No credit card required.",
                icon: "bi-person-plus-fill",
              },
              {
                step: "02",
                title: "Add Cases",
                description:
                  "Import your cases and upload documents to get organized.",
                icon: "bi-folder-plus",
              },
              {
                step: "03",
                title: "Work Smarter",
                description:
                  "Access everything from anywhere and boost your productivity.",
                icon: "bi-lightning-charge-fill",
              },
            ].map((step, index) => (
              <div
                key={index}
                className="fade-in"
                style={{
                  animationDelay: `${index * 0.15}s`,
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    width: "80px",
                    height: "80px",
                    borderRadius: "50%",
                    background: "var(--text-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1.5rem",
                    position: "relative",
                  }}
                >
                  <i
                    className={`bi ${step.icon}`}
                    style={{ fontSize: "2rem", color: "white" }}
                  ></i>
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      right: "-8px",
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "white",
                      border: "2px solid var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                    }}
                  >
                    {step.step}
                  </div>
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    marginBottom: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ color: "var(--text-secondary)", margin: 0 }}>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20" style={{ background: "var(--bg-secondary)" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "3rem",
              textAlign: "center",
            }}
          >
            {[
              { value: "99.9%", label: "Uptime" },
              { value: "256-bit", label: "Encryption" },
              { value: "Unlimited", label: "Storage" },
              { value: "24/7", label: "Support" },
            ].map((stat, index) => (
              <div
                key={index}
                className="fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  style={{
                    fontSize: "3rem",
                    fontWeight: 800,
                    marginBottom: "0.5rem",
                    color: "var(--text-primary)",
                  }}
                >
                  {stat.value}
                </div>
                <div
                  style={{
                    fontSize: "1rem",
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <div
            className="card"
            style={{
              background: "var(--text-primary)",
              color: "white",
              textAlign: "center",
              padding: "4rem 2rem",
              maxWidth: "800px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2rem, 4vw, 3rem)",
                marginBottom: "1rem",
                color: "white",
              }}
            >
              Ready to transform your practice?
            </h2>
            <p
              style={{
                fontSize: "1.25rem",
                marginBottom: "2.5rem",
                opacity: 0.9,
                color: "white",
              }}
            >
              Join thousands of legal professionals using LegalVault
            </p>
            <div
              className="flex gap-md justify-center"
              style={{ flexWrap: "wrap" }}
            >
              <button
                onClick={() => navigate("/signup")}
                className="btn btn-xl"
                style={{
                  background: "white",
                  color: "var(--text-primary)",
                }}
              >
                <i className="bi bi-rocket-takeoff"></i>
                Start Free Trial
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn btn-xl"
                style={{
                  background: "transparent",
                  color: "white",
                  border: "2px solid white",
                }}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "3rem 0",
          borderTop: "1px solid var(--border-light)",
          background: "var(--bg-secondary)",
        }}
      >
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "3rem",
              marginBottom: "3rem",
            }}
          >
            <div>
              <div className="flex items-center gap-sm mb-4">
                <i
                  className="bi bi-shield-check"
                  style={{ fontSize: "1.5rem", color: "var(--text-primary)" }}
                ></i>
                <span
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  LegalVault
                </span>
              </div>
              <p
                style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}
              >
                The complete case management solution for modern legal
                professionals.
              </p>
            </div>
            <div>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-primary)",
                }}
              >
                Product
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Features
                </a>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Pricing
                </a>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Security
                </a>
              </div>
            </div>
            <div>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-primary)",
                }}
              >
                Company
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  About
                </a>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Contact
                </a>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Careers
                </a>
              </div>
            </div>
            <div>
              <h4
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: "var(--text-primary)",
                }}
              >
                Legal
              </h4>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Privacy
                </a>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Terms
                </a>
                <a
                  href="#"
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  Cookies
                </a>
              </div>
            </div>
          </div>
          <div
            style={{
              paddingTop: "2rem",
              borderTop: "1px solid var(--border-light)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "var(--text-tertiary)",
                margin: 0,
              }}
            >
              © 2025 LegalVault. All rights reserved.
            </p>
            <div className="flex gap-md">
              <a href="#" style={{ color: "var(--text-tertiary)" }}>
                <i
                  className="bi bi-twitter"
                  style={{ fontSize: "1.25rem" }}
                ></i>
              </a>
              <a href="#" style={{ color: "var(--text-tertiary)" }}>
                <i
                  className="bi bi-linkedin"
                  style={{ fontSize: "1.25rem" }}
                ></i>
              </a>
              <a href="#" style={{ color: "var(--text-tertiary)" }}>
                <i className="bi bi-github" style={{ fontSize: "1.25rem" }}></i>
              </a>
            </div>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}
