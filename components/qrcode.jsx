import { useQRCode } from 'next-qrcode';

const QRCode = () => {
  const { inputRef } = useQRCode({
    text: 'https://github.com/bunlong/next-qrcode',
    options: {
      errorCorrectionLevel: 'M',
      margin: 3,
      scale: 4,
      width: 200,
      color: {
        dark: '#010599FF',
        light: '#FFBF60FF',
      },
    },
  });

  return (
    <canvas ref={inputRef} />
  );
};

export default QRCode;
