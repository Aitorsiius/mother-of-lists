import { useState, useEffect } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Network } from '@capacitor/network';

interface NoInternetConnectionProps {
  translations: ReturnType<typeof import("../../utils/translations").useTranslation>;
}

export function NoInternetConnection({ translations: t }: NoInternetConnectionProps) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkCurrentStatus = async () => {
      const status = await Network.getStatus();
      setIsOnline(status.connected);
    };

    checkCurrentStatus();

    const networkListener = Network.addListener('networkStatusChange', (status) => {
      console.log('Network status changed', status);
      setIsOnline(status.connected);
    });

    return () => {
      networkListener.then(listener => listener.remove());
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
        >
          {/* Bloqueamos la propagación de clicks */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full text-center border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
                <WifiOff className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {t.noInternetTitle}
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t.noInternetDesc}
            </p>

            <div className="flex justify-center">
              <button 
                disabled
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-lg cursor-not-allowed text-sm font-medium"
              >
                <RefreshCw className="w-4 h-4 animate-spin" />
                {t.waitingConnection}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}