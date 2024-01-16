import React, { FC } from 'react';
import logo from './logo.svg';
import './App.css';
import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { SelectAJam } from './views/SelectAJam';
import { Jam } from './views/Jam';
import { JamLookup } from './views/JamLookup';
import { IdentityContext } from './context/Identity';

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
    <div className="App">
      <header className="App-header">
        <RouterProvider router={router} />
      </header>
    </div>
  );
}

export default App;
