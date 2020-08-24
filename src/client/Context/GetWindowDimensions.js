import React from 'react';
const viewportContext = React.createContext({});

const ViewportProvider = ({ children }) => {
    // This is the exact same logic that we previously had in our hook

    const [screenWidth, setScreenWidth] = React.useState(window.innerWidth);
    const [screenHeight, setScreenHeight] = React.useState(window.innerHeight);

    const handleWindowResize = () => {
        setScreenWidth(window.innerWidth);
        setScreenHeight(window.innerHeight);
    }

    React.useEffect(() => {
        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, []);

    return (
        <viewportContext.Provider value={{ screenWidth, screenHeight }}>
            {children}
        </viewportContext.Provider>
    );
};

export { viewportContext, ViewportProvider }
