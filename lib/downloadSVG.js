// function to download an SVG element as a PNG file
export const downloadSVG = (
    svgElement,
    fileName = `download-${Date.now()}.png`,
    width = 300,
    height = 300
  ) => {
    // check if SVG element exists
    if (!svgElement) {
      throw new Error('SVG element not found');
    }
  
    return new Promise((resolve, reject) => {
      try {
        // create canvas for converting SVG to PNG
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        // get canvas drawing context
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Could not get canvas context');
        }
        
        // clone SVG to avoid modifying original
        const svg = svgElement.cloneNode(true);
        // convert SVG to string
        const svgData = new XMLSerializer().serializeToString(svg);
        // create image to render SVG
        const img = new Image();
        
        // when image loads, draw it on canvas and trigger download
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          // create download link
          const link = document.createElement('a');
          link.download = fileName;
          link.href = canvas.toDataURL('image/png');
          link.click();
          resolve();
        };
        
        // handle image loading errors
        img.onerror = (error) => reject(error);
        // set image source to SVG data
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
      } catch (error) {
        reject(error);
      }
    });
  };