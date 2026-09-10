import MenuEsquerda from "../components/menuEsquerda/menuEsquerda";
import MenuDireita from "../components/menuDireita/menuDireita";
import ChatBot from "../components/chatBot/chatBot"
import { useRef, useState } from 'react'

function Painel() {

        return(
        <>
            <MenuEsquerda />
            <MenuDireita />
            <ChatBot/>
            
        </>
    )
}

export default Painel
