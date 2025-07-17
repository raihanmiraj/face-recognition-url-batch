import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthContextProvider";
import { useContext, useEffect } from "react";

function PrivateRoute({children}) {
  const navigate = useNavigate(); 
  const  { registerUser, user, logOut, loginUser,isLogged,setIsLogged }  = useContext(AuthContext);
  useEffect(() => {

    if(!isLogged){
      return  navigate("/login")
    }
  }, []); 

  return <>{isLogged  &&  children  }    </>
}

export default PrivateRoute;
