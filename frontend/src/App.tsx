import React from 'react';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SelectAJam } from './views/SelectAJam';
import { Jam } from './views/Jam';
import { JamLookup } from './views/JamLookup';
import { IdentityContext } from './context/Identity';
import {
  ChakraBaseProvider,
  extendBaseTheme,
  theme as chakraTheme,
} from '@chakra-ui/react';

// Chakra base theme: https://chakra-ui.com/getting-started#chakrabaseprovider
const { Button, Tabs, Input, Container } = chakraTheme.components;
const theme = extendBaseTheme({
  components: {
    Button,
    Tabs,
    Input,
    Container,
  },
});

// ROUTING
const router = createBrowserRouter([
  {
    path: '/',
    Component: SelectAJam,
  },
  {
    path: '/jam/:jamId',
    element: (
      <IdentityContext>
        <Jam />
      </IdentityContext>
    ),
  },
  {
    path: '/:phrase',
    Component: JamLookup,
  },
]);

function App() {
  return (
    <ChakraBaseProvider theme={theme}>
      <div className="App">
        <header className="App-header">
          <RouterProvider router={router} />
        </header>
      </div>
    </ChakraBaseProvider>
  );
}

export default App;
