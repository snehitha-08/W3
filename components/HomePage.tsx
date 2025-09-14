import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Logo = () => (
  <div className="text-center text-[#4A4A4A] dark:text-gray-200">
    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#5E6D55]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 3L2 12h3v8h14v-8h3L12 3z" />
      <path d="M9 21V15a1 1 0 011-1h4a1 1 0 011 1v6" />
      <path d="M22 9l-2.5-2.5" />
      <path d="M2 9l2.5-2.5" />
      <path d="M12 3V1" />
    </svg>
    <h1 className="text-2xl font-bold tracking-wider mt-2">W3</h1>
    <p className="text-sm text-gray-500 dark:text-gray-400">Wish World Wonders</p>
  </div>
);


const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="w-full max-w-7xl mx-auto flex items-center justify-center p-4 min-h-screen">
          <div className="bg-[#F9F8F4] bg-opacity-90 dark:bg-gray-800 dark:bg-opacity-90 backdrop-blur-sm p-8 md:p-12 rounded-[40px] shadow-2xl text-center w-full max-w-sm">
            <div className="mb-10">
              <Logo />
            </div>
            <div className="space-y-4">
              <Link
                to="/browse"
                className="block w-full text-center bg-[#5E6D55] text-white font-semibold py-4 px-6 rounded-2xl text-lg hover:bg-[#4a5744] transition-transform transform hover:scale-105 duration-300 shadow-lg"
              >
                Browse Kits
              </Link>
               <Link
                to="/profile"
                className="block w-full text-center bg-[#D9BFA9] text-[#4A4A4A] font-semibold py-4 px-6 rounded-2xl text-lg transition-transform transform hover:scale-105 duration-300 shadow-lg"
              >
                Profile
              </Link>
              <button
                onClick={() => setIsModalOpen(true)}
                className="block w-full text-center bg-gray-500 text-white font-semibold py-4 px-6 rounded-2xl text-lg hover:bg-gray-600 transition-transform transform hover:scale-105 duration-300 shadow-lg"
              >
                Contact Us / Support
              </button>
            </div>
          </div>
      </div>

      {isModalOpen && (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans"
            onClick={() => setIsModalOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-modal-title"
        >
          <div 
            className="bg-[#F9F8F4] dark:bg-gray-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)} 
              className="absolute top-4 right-4 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close contact modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 id="contact-modal-title" className="text-2xl font-bold text-[#5E6D55] mb-6 text-center">Contact Information</h2>
            <div className="space-y-5">
              <div className="flex items-center space-x-4">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8A9AAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                <a href="tel:+919700459359" className="text-gray-700 dark:text-gray-300 hover:text-[#5E6D55] transition-colors">+91 9700459359</a>
              </div>
              <div className="flex items-center space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8A9AAB]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                <a href="mailto:contact.wishworldwonders@gmail.com" className="text-gray-700 dark:text-gray-300 hover:text-[#5E6D55] transition-colors">contact.wishworldwonders@gmail.com</a>
              </div>
               <div className="flex items-center space-x-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#25D366]" fill="currentColor" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.49 3.51 1.38 5l-1.52 5.54 5.67-1.5c1.43.81 3.01 1.24 4.63 1.24h.01c5.46 0 9.91-4.45 9.91-9.91 0-5.46-4.45-9.89-9.91-9.89zM17.18 14.45c-.18-.09-1.07-.53-1.24-.59-.17-.06-.29-.09-.42.09-.12.18-.47.59-.57.71-.11.12-.21.14-.39.05-.18-.09-1.25-.46-2.38-1.47-.88-.79-1.47-1.75-1.61-2.04-.14-.29-.02-.45.08-.59.09-.13.21-.32.31-.43.1-.11.13-.18.2-.31.06-.12.03-.23-.03-.32-.06-.09-.42-1.02-.57-1.39-.15-.38-.3-.32-.42-.32h-.38c-.12 0-.32.05-.48.23-.17.18-.65.64-.65 1.57 0 .93.67 1.83.76 1.95.09.12 1.32 2.01 3.2 2.82.46.19.82.31 1.1.4.52.17.98.14 1.35.09.41-.06 1.25-.51 1.42-1 .18-.49.18-.9.12-1-.05-.09-.18-.14-.38-.23z"/></svg>
                <a href={`https://wa.me/919700459359?text=${encodeURIComponent("Hello W3! I have a question about your services.")}`} target="_blank" rel="noopener noreferrer" className="text-gray-700 dark:text-gray-300 hover:text-[#5E6D55] transition-colors">Chat on WhatsApp</a>
              </div>
              <a 
                href="https://www.google.com/maps/place/F8CP%2B78H+Brindavanam+Apartments,+Sri+Maruthi+Nagar+Colony,+Kondapur,+Serilingampalle+(M),+Telangana+500084/data=!4m2!3m1!1s0x3bcb93007786db21:0x828820591df6c16e?utm_source=mstt_1&entry=gps" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="flex items-start space-x-4 group"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#8A9AAB] flex-shrink-0 mt-1 group-hover:text-[#5E6D55] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                 </svg>
                <p className="text-gray-700 dark:text-gray-300 group-hover:underline">
                    Flat No:402, Brindavanam Apartments<br />
                    Sri Maruthi Nagar Colony, Link Road 12<br />
                    Masjid Banda, Kondapur<br />
                    HYDERABAD, TELANGANA 500084<br />
                    India
                </p>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default HomePage;