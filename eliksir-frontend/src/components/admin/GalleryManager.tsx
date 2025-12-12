import React, { useState } from 'react';

const GalleryManager: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          newImages.push(event.target.result as string);
          if (newImages.length === files.length) {
            setImages((prev) => [...prev, ...newImages]);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const deleteImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6">
        Zarządzanie galerią
      </h1>

      <div className="mb-8">
        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center">
          <input
            type="file"
            id="image-upload"
            multiple
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <label
            htmlFor="image-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-amber-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
            </div>
            <p className="text-white font-medium mb-2">Dodaj zdjęcia</p>
            <p className="text-gray-400 text-sm">
              Przeciągnij lub kliknij, aby wybrać pliki
            </p>
            <p className="text-gray-500 text-xs mt-1">JPG, PNG, GIF do 5MB</p>
          </label>
        </div>
      </div>

      {images.length > 0 ? (
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            Zdjęcia w galerii ({images.length})
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  alt={`Gallery ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  onClick={() => deleteImage(index)}
                  className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            Brak zdjęć w galerii
          </h3>
          <p className="text-gray-400">
            Dodaj pierwsze zdjęcia, aby wypełnić galerię
          </p>
        </div>
      )}
    </div>
  );
};

export default GalleryManager;
