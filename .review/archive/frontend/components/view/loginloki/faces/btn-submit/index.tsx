'use client'
import React, { useState } from 'react'
import {  isValidEmail } from "@/functions"
import { notify } from "@/components/nano"
import { print } from "graphql"
import { useRouter } from 'next/navigation';
import "./btnSubmitBasic.scss"

import { useAuthStore } from "@/context/auth/AuthContext"

import {
  REGISTER_USUARIO,
  LOGIN_USUARIO,
  SEND_RESET_PASSWORD,
  RESET_PASS_WITH_TOKEN,
} from "@/query"

interface BtnSubmitBasicProps {
  children: React.ReactNode
  className?: string
  id?: string
  disable?: boolean
  formData: any
  context: 'login' | 'register' | 'recover-password' | 'reboot-password'
  setChangePassword?: (value: boolean) => void
}

const BtnSubmitBasic = ({
  children,
  className = "",
  id = "",
  formData,
  context,
  setChangePassword
}: BtnSubmitBasicProps) => {

  const { setLogin } = useAuthStore()
  const [loading, setLoading] = useState(false)

  const router = useRouter();

  const endpoint = `/graphql`;

  const handleSubmit = async () => {
    try {
     

      const data = { ...formData.data.current }
      const rebootToken = localStorage.getItem("reboot-token") || null

      // ─── Validaciones comunes ───────────────────────────────────────
      if (!data.email && context !== "reboot-password") {
        notify({ type: "error", message: "El email es requerido" })
        return
      }

      console.log(context)

      if (!data.password && context !== "recover-password") {
        notify({ type: "error", message: "La contraseña es requerida" })
        return
      }

      if (context === "register" || context === "reboot-password") {
        if (!data.confirmPassword) {
          notify({ type: "error", message: "La confirmación de la contraseña es requerida" })
          return
        }
        if (data.password !== data.confirmPassword) {
          notify({ type: "error", message: "Las contraseñas no coinciden" })
          return
        }
        // if (!isStrongPassword(data.password)) {
        //   notify({ type: "warning", message: "La contraseña debe tener al menos 8 caracteres, incluir letras, números y al menos un símbolo" })
        //   return
        // }
      }

      if (context === "register") {
        if (!isValidEmail(data.email)) {
          notify({ type: "error", message: "El email no es válido" })
          return
        }
        if (!data.primerNombre) {
          notify({ type: "error", message: "El primer nombre es requerido" })
          return
        }
        if (!data.primerApellido) {
          notify({ type: "error", message: "El primer apellido es requerido" })
          return
        }
        if (!data.telefono) {
          notify({ type: "error", message: "El teléfono es requerido" })
          return
        }
        if (!data.cedula) {
          notify({ type: "error", message: "La cédula es requerida" })
          return
        }
      }

      // ─── Config de la query según el contexto ─────────────────────
      let queryConfig: any

      switch (context) {
        case "login":
          queryConfig = {
            query: LOGIN_USUARIO,
            variables: {
              email: data.email.toLowerCase(),
              password: data.password,
              // captchaToken: tokenCaptcha,
            },
          }
          break

        case "register":
          queryConfig = {
            query: REGISTER_USUARIO,
            variables: {
              primerNombre: data.primerNombre,
              primerApellido: data.primerApellido,
              telefono: data.telefono,
              cedula: data.cedula,
              email: data.email.toLowerCase(),
              password: data.password,
              // captchaToken: tokenCaptcha,
            },
          }
          break

        case "recover-password":
          queryConfig = {
            query: SEND_RESET_PASSWORD,
            variables: {
              email: data.email.toLowerCase(),
            },
          }
          break

        case "reboot-password":
          localStorage.removeItem("reboot-token");
          setChangePassword && setChangePassword(false);

          queryConfig = {
            query: RESET_PASS_WITH_TOKEN,
            variables: {
              token: rebootToken,
              nuevaContrasena: data.password,
            },
          }
          break
      }

      // ─── Fetch ─────────────────────
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: print(queryConfig.query),
          variables: queryConfig.variables,
        }),
      })

      const responseJson = await response.json()

      // ─── Manejar la respuesta ────────────────────────────────────────
      let responseData: any

      switch (context) {
        case "login":
          responseData = responseJson.data.loginUsuario
          break
        case "register":
          responseData = responseJson.data.registerUsuario
          break
        case "recover-password":
          responseData = responseJson.data.resetSendEmail
          break
        case "reboot-password":
          responseData = responseJson.data.resetPassWithToken
          break
      }

      const { type, message, data: datos } = responseData

      notify({ type, message })

      if (type === "error") return
      if (context === "recover-password" || context === "reboot-password") return

      localStorage.setItem("token", datos.token)

      setLogin({
        token: datos.token,
        usuario: {
          ...datos
        }
      })

      router.push("/dashboard")

    } catch (error) {
      console.error("Error en el submit:", error)
      notify({ type: "error", message: "Ocurrió un error inesperado" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`btn-submit-basic ${className}`} id={id}>
      <button
        disabled={loading}
        onClick={() => {
          setLoading(true)
          handleSubmit()
        }}
      >
        {children}
      </button>
    </div>
  )
}

export default BtnSubmitBasic