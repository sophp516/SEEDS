import React, { useEffect } from "react";
import { db } from "../services/firestore.js";
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = React.useState({
    loggedInUser: null,
    displayName: null,
    schoolName: null,
  });

  const setLoggedInUser = (user) => {
    setUser({
      loggedInUser: user,
      displayName: user ? user.displayName : null,
      schoolName: user ? user.schoolName : null,
    });
  };

  const fetchDisplayName = async () => {
    try {
      if (user.loggedInUser && !user.displayName) {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('id', '==', user.loggedInUser.uid));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          setUser(prevUser => ({
            ...prevUser,
            displayName: userData.displayName,
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching displayName:', error);
    }
  };

  useEffect(() => {
    fetchDisplayName();
  }, [user.loggedInUser]);

  return (
    <AuthContext.Provider value={{ user, setLoggedInUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => React.useContext(AuthContext);

export default AuthContext;
