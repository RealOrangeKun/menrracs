import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  let navigate = useNavigate(); 
  const routeChange = () =>{ 
    let path = `/files`; 
    navigate(path);
  }
  return (
    <div className="bg-gray-100">
      <section className="bg-blue-500 text-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Store, Access, and Share Your Files Anywhere, Anytime.</h1>
          <button className="bg-white text-blue-500 px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-400 hover:text-white" onClick={routeChange} >Get Started</button>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Item */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-xl font-semibold mb-4">Secure Encryption</h3>
              <p>Your files are securely encrypted to protect your privacy.</p>
            </div>
            {/* Repeat for other features */}
          </div>
        </div>
      </section>

      {/* How It Works Section, Testimonials, Pricing Plans, Call-to-Action, Footer */}
      {/* Add these sections similar to the previous one */}

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-6">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Menrracs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
