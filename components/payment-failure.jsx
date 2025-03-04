export default function PaymentFailure() {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Payment Failed!
          </h1>
          <p className="text-gray-700">
            Unfortunately, your payment could not be processed. Please try again.
          </p>
          <a
            href="/"
            className="mt-6 inline-block px-6 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }