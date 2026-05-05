import React, { createContext, useContext, useState } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [defaultService, setDefaultService] = useState(null);

  const openQuote = (serviceId = null) => {
    setDefaultService(serviceId);
    setQuoteOpen(true);
  };
  const closeQuote = () => setQuoteOpen(false);
  const openContact = () => setContactOpen(true);
  const closeContact = () => setContactOpen(false);

  return (
    <ModalContext.Provider
      value={{ quoteOpen, contactOpen, openQuote, closeQuote, openContact, closeContact, defaultService }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModals = () => useContext(ModalContext);
