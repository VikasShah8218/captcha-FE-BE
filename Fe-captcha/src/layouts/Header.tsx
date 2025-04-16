import React from "react";
import { Outlet } from "react-router-dom";
import { logout } from "../../app/slices/authSlice";
import { useDispatch ,useSelector} from "react-redux";
import { postToServer } from '../../globals/requests';
import { useNavigate } from "react-router-dom";
import NDCImage from "../../assets/images/image_01.png"
import Footer from "./footer";
import "./nav.css"

const Header: React.FC = () => {
  // const navigate = useNavigate();
  // const dispatch = useDispatch();
  // const loggedInUser =  useSelector((state:any) => state.auth.user)
  // const handleLogout = async () => {
  //     // await postToServer("/accounts/logout/",{"refresh": localStorage.getItem("auth_token")});
  //     // dispatch(logout())
  // }


  return (
    <>
    <Outlet />
    {/* <Footer /> */}
    </>
    
  );
};

export default Header;
