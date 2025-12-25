export function SplashScreen() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-between bg-white dark:bg-gray-900 z-50">
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white text-center px-8">
          Mother Of Lists
        </h1>
      </div>
      <div className="pb-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
