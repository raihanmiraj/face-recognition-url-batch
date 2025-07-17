import React, { createContext, useContext, useEffect, useState } from 'react';

import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useLocation,
  useParams,
} from "react-router-dom";
import axios from 'axios';


import FaceMealStatus from '../FaceMealStatus/FaceMealStatus';
import Layout from '../Layout/Layout';
import AddImages from '../Pages/AddImages';
import ImagesList from '../Pages/ImagesList';
const RouteHandle = () => {


  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        {
          path: "",
          element: <FaceMealStatus />,
        },
        {
          path: "add-image",
          element: <AddImages />,
        },
        {
          path: "images-list",
          element: <ImagesList />,
        },

      ]
    }]

  );



  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

export default RouteHandle;
