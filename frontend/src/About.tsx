import React from 'react';

const AboutUsPage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">About Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Team Member 1 */}
        <div className="bg-gray-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">John Doe</h2>
          <p className="text-gray-600">CEO</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ac elit aliquam, pulvinar leo non, vestibulum eros.</p>
        </div>
        {/* Team Member 2 */}
        <div className="bg-gray-100 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">Jane Smith</h2>
          <p className="text-gray-600">CTO</p>
          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam ac elit aliquam, pulvinar leo non, vestibulum eros.</p>
        </div>
        {/* Add more team members as needed */}
      </div>
    </div>
  );
}

export default AboutUsPage;
