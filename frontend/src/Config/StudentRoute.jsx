import { Navigate, Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../Provider/AuthContextProvider";
import { useContext, useEffect } from "react";

function StudentRoute({children}) {
  const navigate = useNavigate(); 
  const  { registerUser, user, logOut, loginUser,isLogged,setIsLogged, isStudent, isManager ,loading}  = useContext(AuthContext);
  useEffect(() => {
 
if(isManager ){
  return navigate("/dashboard")
}
    if(!isStudent  && !loading){
     return navigate("/login")
    }
  }, [isStudent]); 

  return <>{isStudent  &&  children  }    </>
}

export default StudentRoute;
