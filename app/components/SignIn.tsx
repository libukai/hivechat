import { signIn } from "@/auth"
import Image from "next/image"
import mulanhua from "@/app/images/mulanhua.png"
 
function Login() {
  return (
    <>
      <div className="flex items-center justify-center mb-6">
        <Image src={mulanhua} alt="HiveChat logo" width={248} height={24} />
      </div>
      <form
        action={async (formData) => {
          "use server"
          await signIn("credentials", formData)
        }}
      >
        <label>
          Email
          <input name="email" type="email" />
        </label>
        <label>
          Password
          <input name="password" type="password" />
        </label>
        <button>Sign In</button>
      </form>
    </>
  )
}

export default Login
