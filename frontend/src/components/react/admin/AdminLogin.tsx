import React, { useState, useRef } from "react";
import { apiLogin, apiGetMe } from "./api";
import type { AdminUser } from "./types";

interface Props {
  onLoginSuccess: (user: AdminUser) => void;
}

export const AdminLogin: React.FC<Props> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const [pwMsg, setPwMsg] = useState("");
  const [formMsg, setFormMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const pwRef = useRef<HTMLInputElement>(null);

  const handlePasswordKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState && e.getModifierState("CapsLock")) {
      setPwMsg("Caps Lock is on.");
    } else if (pwMsg === "Caps Lock is on.") {
      setPwMsg("");
    }
  };

  const handleForgotClick = () => {
    setFormMsg("Ask the store owner to reset your password.");
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setFormMsg("");
    let ok = true;
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!valid) {
      setEmailMsg("Enter a valid email address, like name@naseerhardware.com.");
      emailRef.current?.focus();
      ok = false;
    } else {
      setEmailMsg("");
    }

    if (!password) {
      setPwMsg("Enter your password.");
      if (ok) pwRef.current?.focus();
      ok = false;
    } else if (pwMsg !== "Caps Lock is on.") {
      setPwMsg("");
    }

    if (!ok) return;

    setLoading(true);
    try {
      await apiLogin(email.trim(), password);
      const user = await apiGetMe();
      onLoginSuccess(user);
    } catch (err: any) {
      setFormMsg(err.message || "Invalid credentials or account inactive.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="shell">
      <section className="brand" aria-label="Naseer Hardware">
        <svg className="mark" viewBox="0 0 44 44" aria-hidden="true">
          <path
            d="M22 3 5 9.5v12.2C5 31.6 12 39.4 22 42c10-2.6 17-10.4 17-20.3V9.5L22 3Z"
            fill="none"
            stroke="#000"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M22 3v39C12 39.400 5 31.600 5 21.700V9.500L22 3Z"
            fill="#000"
          />
        </svg>
        <div>
          <h1 className="wordmark">
            Naseer
            <br />
            Hardware
          </h1>
          <p>Admin control panel for orders, stock and staff.</p>
        </div>
        <div className="ruler" aria-hidden="true"></div>
      </section>

      <section className="panel">
        <div className="form-wrap">
          <h2>Sign in</h2>
          <p className="lead">Use your staff email address to open the admin panel.</p>

          <form id="login" noValidate onSubmit={handleSubmit}>
            <div className="field">
              <div className="row">
                <label htmlFor="email">Email address</label>
              </div>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                placeholder="name@naseerhardware.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-invalid={emailMsg ? "true" : "false"}
              />
              <p className="msg" id="email-msg" role="alert">
                {emailMsg}
              </p>
            </div>

            <div className="field">
              <div className="row">
                <label htmlFor="password">Password</label>
                <button
                  type="button"
                  className="link"
                  id="forgot"
                  onClick={handleForgotClick}
                >
                  Forgot password?
                </button>
              </div>
              <div className="control">
                <input
                  ref={pwRef}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handlePasswordKeyUp}
                  aria-invalid={pwMsg && pwMsg !== "Caps Lock is on." ? "true" : "false"}
                />
                <button
                  type="button"
                  className="toggle"
                  id="toggle"
                  aria-pressed={showPassword}
                  aria-controls="password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p
                className={`msg ${pwMsg === "Caps Lock is on." ? "info" : ""}`}
                id="pw-msg"
                role="status"
              >
                {pwMsg}
              </p>
            </div>

            <button
              className="submit"
              id="submit"
              type="submit"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
            <p
              className={`msg ${formMsg.includes("Ask") ? "info" : ""}`}
              id="form-msg"
              role="status"
              style={{ marginTop: "12px" }}
            >
              {formMsg}
            </p>
          </form>

          <p className="fine">Authorized staff only. Every sign-in attempt is recorded.</p>
        </div>
      </section>

      <style>{`
        :root, .shell {
          color-scheme: dark;
          --black: #000;
          --surface: #131313;
          --line: #2b2b2b;
          --text: #f4f4f4;
          --muted: #9a9a9a;
          --red: #e4202c;
          --red-hot: #ff3340;
          --font-display: "Archivo", "Arial Narrow", Arial, sans-serif;
          --font-body: "IBM Plex Sans", system-ui, -apple-system, "Segoe UI", sans-serif;
          box-sizing: border-box;
          padding-top: env(safe-area-inset-top, 0px);
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }

        .shell {
          min-height: 100vh;
          min-height: 100dvh;
          display: grid;
          grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr);
          background: var(--black);
          color: var(--text);
          font-family: var(--font-body);
          -webkit-font-smoothing: antialiased;
        }

        .shell *, .shell *::before, .shell *::after {
          box-sizing: border-box;
        }

        /* ---------- Brand panel ---------- */
        .brand {
          background: var(--red);
          color: #000;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: clamp(28px, 5vw, 64px);
          padding-bottom: 120px;
          overflow: hidden;
        }
        .mark { width: 44px; height: 44px; display: block; }
        .wordmark {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: clamp(56px, 9vw, 136px);
          line-height: 0.88;
          letter-spacing: -0.04em;
          margin: 0;
        }
        .brand p {
          margin: 20px 0 0;
          font-size: 18px;
          font-weight: 500;
          max-width: 28ch;
          line-height: 1.4;
        }
        /* Tape-measure edge: ticks drawn with gradients */
        .ruler {
          position: absolute;
          left: 0; right: 0; bottom: 0;
          height: 72px;
          background-image:
            linear-gradient(to right, #000 2px, transparent 0),
            linear-gradient(to right, #000 2px, transparent 0),
            linear-gradient(to right, #000 3px, transparent 0);
          background-size: 12px 16px, 60px 30px, 120px 48px;
          background-repeat: repeat-x;
          background-position: 0 100%;
        }
        .ruler::after {
          content: "";
          position: absolute; left: 0; right: 0; bottom: 0; height: 3px; background: #000;
        }

        /* ---------- Form panel ---------- */
        .panel {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: clamp(28px, 5vw, 64px);
          background: var(--black);
        }
        .form-wrap { width: 100%; max-width: 380px; }
        .panel h2 {
          font-family: var(--font-display);
          font-weight: 800;
          font-size: 36px;
          letter-spacing: -0.02em;
          line-height: 1.05;
          margin: 0 0 10px;
          color: var(--text);
        }
        .lead { margin: 0 0 36px; color: var(--muted); font-size: 16px; line-height: 1.5; }

        .field { margin-bottom: 22px; }
        .row { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
        .field label { font-size: 14px; font-weight: 500; color: var(--text); }
        .link {
          font-size: 14px; color: var(--muted); text-decoration: underline;
          text-underline-offset: 3px; text-decoration-color: var(--line);
          background: none; border: 0; padding: 0; cursor: pointer; font-family: inherit;
        }
        .link:hover { color: var(--text); text-decoration-color: var(--red); }

        .control { position: relative; }
        .control input, .field input {
          width: 100%;
          height: 52px;
          background: var(--surface);
          color: var(--text);
          border: 1px solid var(--line);
          border-radius: 4px;
          padding: 0 16px;
          font: 400 16px/1 var(--font-body);
          transition: border-color .15s, box-shadow .15s;
          box-sizing: border-box;
        }
        .control input::placeholder, .field input::placeholder { color: #5f5f5f; }
        .control input:hover, .field input:hover { border-color: #444; }
        .control input:focus-visible, .field input:focus-visible {
          outline: none;
          border-color: var(--red-hot);
          box-shadow: 0 0 0 3px rgba(228, 32, 44, .3);
        }
        .control input[aria-invalid="true"], .field input[aria-invalid="true"] { border-color: var(--red-hot); }
        #password { padding-right: 76px; }
        .toggle {
          position: absolute; right: 6px; top: 6px; height: 40px; padding: 0 12px;
          background: none; border: 0; border-radius: 3px; color: var(--muted);
          font: 500 14px var(--font-body); cursor: pointer;
        }
        .toggle:hover { color: var(--text); }
        .toggle:focus-visible { outline: 2px solid var(--red-hot); outline-offset: 0; }

        .msg { min-height: 20px; margin: 8px 0 0; font-size: 13px; color: var(--red-hot); }
        .msg.info { color: var(--muted); }

        .submit {
          width: 100%; height: 54px; margin-top: 6px;
          background: var(--red); color: #000;
          border: 0; border-radius: 4px;
          font: 800 17px var(--font-display); letter-spacing: 0;
          cursor: pointer;
          transition: background .15s, transform .08s;
        }
        .submit:hover { background: var(--red-hot); }
        .submit:active { transform: translateY(1px); }
        .submit:focus-visible { outline: 2px solid #fff; outline-offset: 3px; }
        .submit[disabled] { background: #5a1015; color: #c9a0a3; cursor: progress; }

        .fine {
          margin: 32px 0 0; padding-top: 20px; border-top: 1px solid var(--line);
          font-size: 13px; line-height: 1.5; color: var(--muted);
        }

        /* One orchestrated entrance: the wordmark settles in */
        @media (prefers-reduced-motion: no-preference) {
          .wordmark { animation: settle .7s cubic-bezier(.2,.8,.2,1) both; }
          @keyframes settle { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: none; } }
        }

        @media (max-width: 860px) {
          .shell { grid-template-columns: 1fr; }
          .brand { padding-bottom: 88px; gap: 40px; }
          .wordmark { font-size: clamp(52px, 17vw, 96px); }
          .ruler { height: 52px; background-size: 12px 12px, 60px 22px, 120px 34px; }
          .panel { align-items: flex-start; }
        }
      `}</style>
    </main>
  );
};
