import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthContextProvider";
import { useContext } from "react";

function RestictedPublicRoute({ children }) {
  const navigate = useNavigate();
  const { registerUser, user, logOut, loginUser, isLogged, setIsLogged, isStudent, isManager ,loading} = useContext(AuthContext);
  useEffect(() => {
    if ( isLogged   && !loading) {
      // console.log(isLogged ,isStudent ,isManager,loading)
      if(isManager){
        return navigate("/dashboard")
      }else if(isStudent){
        return navigate("/managers")
      }
      return navigate("/")
    }
  }, [isLogged]);
  return <>{!isLogged && children} </>
}

export default RestictedPublicRoute;
