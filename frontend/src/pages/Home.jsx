import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) navigate("/elections");
  }, [user, navigate]);

  return (
    <div className="bg-[#0d1117] min-h-screen flex flex-col text-white overflow-x-hidden">

      {/* HERO SECTION */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 h-[90vh]">

        {/* Soft Glow Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-blue-500/10 to-purple-500/10 blur-[140px] opacity-50"></div>

        {/* Hero Image */}
        <img
          src="https://rejolut.com/wp-content/uploads/2022/02/voting7.png"
          alt="Voting Illustration"
          className="w-[320px] sm:w-[480px] lg:w-[550px] mb-10 drop-shadow-[0_0_28px_rgba(0,255,200,0.18)] animate-[float_5s_ease-in-out_infinite] "
        />

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-6 leading-tight">
          Blockchain Based
          <span className="block mt-3 text-green-400 drop-shadow-[0_0_20px_rgba(0,255,150,0.5)]">
            Voting Platform
          </span>
        </h1>

        <p className="max-w-3xl text-gray-300 text-xl sm:text-2xl mt-2 mb-14">
          A trusted digital voting platform powered by blockchain for secure, tamper-proof, and transparent elections.
        </p>

      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-[#0f1624] border-t border-gray-800">
        <h2 className="text-5xl font-bold text-center mb-16 tracking-wide">
          Why Choose Our Platform?
        </h2>

        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-14 px-6">

          {/* Card 1 */}
          <div className="p-8 bg-gray-900/60 border border-gray-700 rounded-2xl backdrop-blur-md shadow-xl hover:-translate-y-2 hover:shadow-green-500/40 transition-all">
            <img
              src="https://lh7-us.googleusercontent.com/zPW-Whm4ftWBKN0oSGpLfODGfdDa5KbCuAlD4NKM9eE8X4BiTnlXuH8myKa3ExN9Qk2-B8pCnPshZbWxWpvd-uMWaaNibsQi4qlbAdgSYaJlXf2nuHDZnBzxlA_rQfGXsGKlIApPiGIDONu1mU5_XZU"
              className="h-40 mx-auto mb-6 rounded-lg object-cover"
              alt="Tamper Proof"
            />
            <h3 className="text-2xl font-bold mb-3">🛡 Tamper-Proof</h3>
            <p className="text-gray-300 text-lg">
              Blockchain ensures no manipulation or unauthorized modifications to votes.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 bg-gray-900/60 border border-gray-700 rounded-2xl backdrop-blur-md shadow-xl hover:-translate-y-2 hover:shadow-blue-500/40 transition-all">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUhMZH6YziVj9zZt70wjN8Xl4DLznnffsisg&s"
              className="h-40 mx-auto mb-6 rounded-lg object-cover"
              alt="Real Time"
            />
            <h3 className="text-2xl font-bold mb-3">⚡ Instant Results</h3>
            <p className="text-gray-300 text-lg">
              Real-time counting and results with complete transparency.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 bg-gray-900/60 border border-gray-700 rounded-2xl backdrop-blur-md shadow-xl hover:-translate-y-2 hover:shadow-purple-500/40 transition-all">
            <img
              src="https://pixelplex.io/wp-content/uploads/2020/09/1600x700_Everything-You-Need-to-Know-About-Blockchain-Security-min.jpg"
              className="h-40 mx-auto mb-6 rounded-lg object-cover"
              alt="Authentication"
            />
            <h3 className="text-2xl font-bold mb-3">🔐 Secure Login</h3>
            <p className="text-gray-300 text-lg">
              Authenticate with Web3 wallet + Aadhaar/Voter ID verification.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 text-center text-gray-500 border-t border-gray-800 bg-[#0f1624]">
        © {new Date().getFullYear()} eVoting DApp • Built for Transparent Democracy
      </footer>
    </div>
  );
};

export default Home;
