import React, { createContext, useContext, useState, ReactNode } from "react";
import CustomAlert from ".";


type AlertContextType = {
  customAlert: (title: string, message: string, onClose?: () => void) => void;
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within AlertProvider");
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [onClose, setOnClose] = useState<() => void>(() => () => {});

  const customAlert = (title: string, message: string, onCloseFn?: () => void) => {
    setTitle(title);
    setMessage(message);
    setOnClose(() => () => {
      setVisible(false);
      onCloseFn?.();
    });
    setVisible(true);
  };

  return (
    <AlertContext.Provider value={{ customAlert }}>
      {children}
      <CustomAlert visible={visible} title={title} message={message} onClose={onClose} />
    </AlertContext.Provider>
  );
};
