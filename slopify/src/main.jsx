import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import CssBaseline from "@mui/material/CssBaseline";

import { ThemeProvider, createTheme } from "@mui/material/styles";

const theme = createTheme({
    
    palette: {
        primary: {
            main: "#00174F",
        },
    },
});

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <CssBaseline>
            <ThemeProvider theme={theme}>
                <App />
            </ThemeProvider>
        </CssBaseline>
    </StrictMode>
);
