// contexts/ThingSpeakContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThingSpeakData {
  field1: string;
  created_at: string;
}

interface ThingSpeakContextProps {
  data: ThingSpeakData[];
  error: string | null;
  loading: boolean;
}

const ThingSpeakContext = createContext<ThingSpeakContextProps | undefined>(undefined);

export const ThingSpeakProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<ThingSpeakData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.thingspeak.com/channels/2267935/fields/1.json?results=2'
        );
        if (!response.ok) {
          throw new Error(`Error: ${response.status} - ${response.statusText}`);
        }
        const jsonData = await response.json();
        const extractedData = jsonData.feeds.map((feed: any) => ({
          field1: feed.field1,
          created_at: feed.created_at,
        }));
        setData(extractedData);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ThingSpeakContext.Provider value={{ data, error, loading }}>
      {children}
    </ThingSpeakContext.Provider>
  );
};

export const useThingSpeak = (): ThingSpeakContextProps => {
  const context = useContext(ThingSpeakContext);
  if (!context) {
    throw new Error('useThingSpeak must be used within a ThingSpeakProvider');
  }
  return context;
};
