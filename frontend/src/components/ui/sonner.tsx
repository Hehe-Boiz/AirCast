"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="top-center"
      toastOptions={{
        style: {
          background: 'white',
          border: '1px solid #e5e7eb',
          color: '#111827',

        },
        classNames: {
          description: 'text-gray-700',
          actionButton: 'bg-emerald-500 text-white',
          cancelButton: 'bg-gray-100 text-gray-700',
          success: 'text-emerald-700',
          error: 'text-red-700',
          info: 'text-blue-700',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
