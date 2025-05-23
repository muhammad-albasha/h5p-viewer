"use client";

// This is just a test file to check how h5p-standalone is structured
// It won't be included in the final code

const checkH5P = async () => {
  try {
    const h5pModule = await import('h5p-standalone');
    console.log('H5P Module structure:', h5pModule);
    
    // Check if there are any named exports
    console.log('Named exports:', Object.keys(h5pModule));
    
    // Check if there's a default export
    console.log('Has default export:', !!h5pModule.default);
    
    // Check the type of the default export if it exists
    if (h5pModule.default) {
      console.log('Default export type:', typeof h5pModule.default);
    }
  } catch (error) {
    console.error('Error importing h5p-standalone:', error);
  }
};

// This would run in a useEffect if used in a component
checkH5P();

export {};
