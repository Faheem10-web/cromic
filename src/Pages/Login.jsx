import "./Login.css";

export default function Login() {
  return (
    <section className="login">

      <div className="login-container">

        <h1>LOGIN</h1>

        <form className="login-form">

          <div className="field">
            <label>EMAIL</label>
            <input type="email" />
          </div>

          <div className="field">

            <div className="password-row">
              <label>PASSWORD</label>

              <a href="#">FORGOT PASSWORD</a>
            </div>

            <input type="password" />

          </div>

          <button type="submit" className="login-btn">
            LOG IN
          </button>

          <a href="#" className="register-link">
            CREATE ACCOUNT
          </a>

        </form>

      </div>

    </section>
  );
}