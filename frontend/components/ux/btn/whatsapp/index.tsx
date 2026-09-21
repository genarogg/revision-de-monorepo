"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useIsMobile } from "@/hooks/use-mobile"
import QRCode from "react-qr-code"
import { FaWhatsapp } from "react-icons/fa"

interface WhatsAppButtonProps {
  phoneNumber: string | null | undefined
  text?: string | null | undefined
}

function WhatsAppButton({ phoneNumber, text }: WhatsAppButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const isMobile = useIsMobile()

  if (!phoneNumber) return null

  // const formattedPhone = phoneNumber.replace(/\D/g, "")

  const whatsappUrl = `https://wa.me/+58${phoneNumber}${text ? `?text=${encodeURIComponent(text)}` : ""}`

  const handleClick = () => {
    if (isMobile) {
      window.open(whatsappUrl, "_blank")
    } else {
      setIsModalOpen(true)
    }
  }

  return (
    <>
      <Button variant="outline" size="icon" onClick={handleClick}>
        <FaWhatsapp className="h-4 w-4" />
      </Button>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[#25D366]">
              <FaWhatsapp className="h-5 w-5" />
              Contactar por WhatsApp
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center gap-4 py-4">
            <div className="p-4 bg-white rounded-lg shadow-md">
              <div className="p-3 bg-[#25D366] rounded-lg">
                <div className="bg-white p-2 rounded">
                  <QRCode value={whatsappUrl} size={180} fgColor="#25D366" level="H" />
                </div>
              </div>
            </div>
            <p className="text-center font-medium">{phoneNumber}</p>
            <Button
              onClick={() => window.open(whatsappUrl, "_blank")}
              className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white"
            >
              <FaWhatsapp className="mr-2 h-4 w-4" />
              Abrir WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default WhatsAppButton