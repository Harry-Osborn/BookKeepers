import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useToast } from "@/components/ui/use-toast";
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const OtpModal = ({ isOpen, email, onClose, onSuccess }) => {
  const [otpArray, setOtpArray] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const { toast } = useToast();
  const inputRefs = useRef([]);

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otpArray];
    newOtp[index] = value;
    setOtpArray(newOtp);
    if (value && index < 3) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = async () => {
    setError('');
    const otp = otpArray.join('');
    if (!/^\d{4}$/.test(otp)) {
      setError('OTP must be a 4-digit number.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL_BACKEND}/auth/verify-otp`, {
        email,
        otp,
      });

      if (response.status === 200) {
        // confetti({
        //   particleCount: 100,
        //   spread: 70,
        //   origin: { y: 0.6 },
        // });
        onSuccess();
        toast({
          title: "Successfully verified! You can login now"
        });
        setOtpArray(['', '', '', ''])
      } else {
        setError('Invalid OTP. Please try again.');
        setOtpArray(['', '', '', ''])
      }
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL_BACKEND}/auth/resend-otp`, { email });
      setResendTimer(30);
      setCanResend(false);
      toast({
        title: "OTP resent successfully."
      });
    } catch (err) {
      toast({
        title: "Failed to resend OTP. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-gray-900 p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-gray-700"
          >
            <h2 className="text-white text-xl font-bold mb-5 text-center tracking-wide">Enter OTP</h2>
            <div className="flex justify-between mb-4">
              {otpArray.map((digit, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputRefs.current[index] = el)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-14 h-14 text-2xl text-center bg-gray-800 text-white rounded-xl border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}

            <div className="flex justify-center mb-4">
              {canResend ? (
                <button
                  onClick={handleResend}
                  className="text-blue-400 hover:underline text-sm"
                >
                  Resend OTP
                </button>
              ) : (
                <span className="text-gray-400 text-sm">Resend in {resendTimer}s</span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={handleOtpSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-2 px-4 rounded-xl w-full transition-all"
              >
                {loading ? 'Verifying...' : 'Verify'}
              </button>
              <button
                onClick={onClose}
                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-xl w-full transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OtpModal;
