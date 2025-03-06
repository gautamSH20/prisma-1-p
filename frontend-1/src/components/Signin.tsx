import axios from "axios";
import { useRef } from "react";
import { BACKEND_URL } from "../config";

export const Signin = () => {
  //@ts-ignore
  const usernameRef = useRef<HTMLInputElement>();
  //@ts-ignore
  const passwordRef = useRef<HTMLInputElement>();

  const SignIn = async () => {
    const username = usernameRef.current?.value;
    const password = passwordRef.current?.value;

    console.log(typeof username, typeof password);
    try {
      const newUser = await axios.post(BACKEND_URL + "/sign", {
        username,
        password,
      });
      console.log(newUser);
    } catch (e) {
      console.log(e);
    }
  };
  return (
    <div className="h-[100vh] flex justify-center items-center  ">
      <div className="bg-slate-600 h-1/2 w-[60vh] flex flex-col items-center p-2 rounded-md animate-new-bounce hover:animate-none  ">
        <h1 className="text-lg mb-10">Welcome to the in-TODO</h1>
        <p>Please enter the details to make an account</p>
        <input
          placeholder="username "
          className="input mb-3 mt-3"
          ref={usernameRef}
        ></input>
        <input
          placeholder="Password"
          className="input mb-3"
          ref={passwordRef}
        ></input>
        <button className="btn btn-soft" onClick={SignIn}>
          Submit
        </button>
      </div>
    </div>
  );
};
