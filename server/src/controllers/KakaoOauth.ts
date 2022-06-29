import models from "../models/KakaoOauth"
import { generateAccessToken, generateRefreshToken } from "./tokenFunction/Token";
import axios from "axios"

const REST_API_KEY = process.env.KAKAO_CLIENT_ID;
const REDIRECT_URI = process.env.SERVER || `http://localhost:3000`

export default {
  get: (req, res) => {
    axios
      .get(
        `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${REST_API_KEY}&redirect_uri=${REDIRECT_URI}`
      )
      .then((data: any) => {
        console.log(`data.config.url ===========`, data.config.url)
        res.json({ data: data.config.url })
      })
      .catch((err) => {
        console.log(err);
        res.json("errr")
      });
  },
  redirect: (req, res) => {
    // const responsedLocation = res.req.url
    // const authorizedCode = res.req.query.code
    const authorizedCode: string = res.req.body.authorizationCode
    console.log(`kakao OAuth authorizedCode ==========`, authorizedCode)
    axios.post(`https://kauth.kakao.com/oauth/token?grant_type=authorization_code&client_id=${process.env.KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&code=${authorizedCode}`)
      .then(async (data: any) => {
        await axios.get(`https://kapi.kakao.com/v2/user/me`, { headers: { Authorization: `Bearer ${data.data.access_token}` } })
          .then(async (userInfo: any) => {
            const email = userInfo.data.kakao_account.email;
            const profile = userInfo.data.kakao_account.profile.thumbnail_image_url;
            models.post(email, profile, (error, result) => {
              if (error) {
                res.status(500).json({ message: "Internal Sever Error" });
              } else {
                const payload = {
                  id: result[0].id,
                  userId: result[0].userId,
                  email: result[0].email,
                  profile: result[0].profile,
                };

                const accessToken = generateAccessToken(payload);
                const refreshToken = generateRefreshToken(payload);

                res
                  .status(200)
                  .cookie("refreshToken", refreshToken, {
                    domain: "localhost",
                    path: "/",
                    sameSite: "none",
                    httpOnly: true,
                    secure: true,
                  })
                  .json({ accessToken: accessToken, userInfo: payload, message: "ok" });
              }
            })
          })
          .catch(err => {
            console.log(err)
          })
      })
      .catch(err => {
        res.status(404);
      })
  }
}
