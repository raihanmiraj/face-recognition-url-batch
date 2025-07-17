import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthContextProvider";
import { useContext, useEffect } from "react";

function ManagerRoute({children}) {
  const navigate = useNavigate(); 
  const  { registerUser, user, logOut, loginUser,isLogged,setIsLogged, isStudent, isManager,loading }  = useContext(AuthContext);
  useEffect(() => {

    if(!isManager  && !loading){
        return  navigate("/admin")
    }
  }, [isManager]); 

  return <>{isManager  &&  children  }    </>
}

export default ManagerRoute;
