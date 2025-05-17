// file: src/account/UserContext.jsx
import { createContext } from "react";

// Provide default values that match the shape of what useMe returns
const UserContext = createContext({
  me: null,
  isLoading: true,
  logout: async () => {},
  refetchMe: async () => {},
});

export default UserContext;