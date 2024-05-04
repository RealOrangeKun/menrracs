import React from 'react';

const ContactUsPage = () => {
  const linkedInMessageUrlFE = 'https://www.linkedin.com/in/seif-ashraf';
  const linkedInMessageUrlBE = 'https://www.linkedin.com/in/yousef-tarek-8a7388247';

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <div className="">
        {/* LinkedIn Message Link */}
        <div>
          <h2 className="text-xl font-semibold mb-2">Connect on LinkedIn</h2>
          <p>Feel free to send us a message on LinkedIn :</p>
          <a href={linkedInMessageUrlBE} className="block mt-2 text-blue-500 hover:underline">Send a Message to Youssef (Back End)</a>
          <a href={linkedInMessageUrlFE} className="block mt-2 text-blue-500 hover:underline">Send a Message to Seif (Front End)</a>
        </div>
      </div>
    </div>
  );
}

export default ContactUsPage;
