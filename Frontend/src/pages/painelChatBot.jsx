import MenuEsquerda from "../components/MenuEsquerda/MenuEsquerda";
import MenuDireita from "../components/MenuDireita/MenuDireita";
import ChatBot from "../components/ChatBot/ChatBot"
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
