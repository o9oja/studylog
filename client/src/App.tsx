import { Signup } from "pages/Signup";
import Login from "pages/Login";
import Landing from "pages/Landing";
import Mypage from "pages/Mypage";
import Room from "pages/Room";
import axios, { AxiosError, AxiosResponse } from "axios";
import { useEffect, useState } from "react";
import Todo from "pages/Todo";
import Creatingroom from "./pages/Creatingroom";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Roomlist from "pages/Roomlist";
import Nav from "./components/Nav";
import Findinfo from "pages/Findinfo";
import { logIn, logout } from "./action/index";
import { useDispatch } from "react-redux";

const SERVER = process.env.REACT_APP_SERVER || "http://localhost:4000";

function App() {
  const dispatch = useDispatch();
  const guestNum = (Math.random() * 10000000).toString().slice(0, 4);
  const geust = `Annoy${guestNum}`;
  const [annoy, setAnnoy] = useState(geust);
  const [roomId, setRoomId] = useState("");
  const url = new URL(window.location.href);
  const authCode = url.searchParams.get("code");

  // --------------------------- OAUTH 로그인---------------------

  const sendAuthCode = (authCode: any) => {
    axios
      .post(`${SERVER}/Oauth`, { authorizationCode: authCode })
      .then((res: AxiosResponse) => {
        console.log("=====Oauth====서버에서 받아옴");
        console.log(res);
        if (res.data.message === "이미 카카오 계정으로 가입한 유저입니다.") {
          alert(res.data.message);
        }
        const accessToken = res.data.accessToken;
        const userInfo = res.data.userInfo;
        dispatch(
          logIn(accessToken, userInfo.id, userInfo.userId, userInfo.email, userInfo.profile)
        );
      })
      .catch((err: AxiosError) => {
        console.log("err:", err);
      });
  };

  const sendKakaoAuthCode = (authCode: any) => {
    axios
      .post(`${SERVER}/kakaoOauth/redirect`, { authorizationCode: authCode })
      .then((data) => {
        console.log("=====kakaoOauth====서버에서 받아옴");
        if (data.data.message === "이미 구글 계정으로 가입한 유저입니다.") {
          alert(data.data.message);
        }
        const accessToken = data.data.accessToken;
        const userInfo = data.data.userInfo;
        dispatch(
          logIn(accessToken, userInfo.id, userInfo.userId, userInfo.email, userInfo.profile)
        );
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    sendAuthCode(authCode);
    sendKakaoAuthCode(authCode);
  }, []);

  window.addEventListener("unload", () => {
    dispatch(logout(""));
  });
  // -----------------
  return (
    //------------------------------------------------------------------------------------------------
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/todos" element={<Todo />} />
        <Route path="/room">
          <Route path=":roomId" element={<Room annoy={annoy} roomId={roomId} />} />
        </Route>
        <Route path="/creatingroom" element={<Creatingroom setRoomId={setRoomId} />} />
        <Route
          path="/roomlist"
          element={<Roomlist annoy={annoy} roomId={roomId} setRoomId={setRoomId} />}
        />
        <Route path="/findinfo" element={<Findinfo />} />
        <Route path="/Nav" element={<Nav />} />
        <Route
          path="/Roomlist"
          element={<Roomlist annoy={annoy} roomId={roomId} setRoomId={setRoomId} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
