import React from 'react';
import GalleryComponent from '../components/Gallery';
import FooterEliksir from '../components/FooterEliksir';

const Gallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-black">
      <div className="pt-20">
        <GalleryComponent />
      </div>
      <FooterEliksir />
    </div>
  );
};

export default Gallery;
