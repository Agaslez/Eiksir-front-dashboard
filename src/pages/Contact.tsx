import React from 'react';
import ContactComponent from '../components/Contact';
import FooterEliksir from '../components/FooterEliksir';

const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <ContactComponent />
      </div>
      <FooterEliksir />
    </div>
  );
};

export default Contact;
