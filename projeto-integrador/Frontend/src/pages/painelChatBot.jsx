import MenuEsquerda from "../components/menuEsquerda/menuEsquerda";
import MenuDireita from "../components/menuDireita/menuDireita";
import Header from "../components/header/header"
import ChatBot from "../components/chatBot/chatBot"
import { useRef, useState } from 'react'

function Painel() {

        return(
        <>
            <Header />
            <MenuEsquerda />
            <MenuDireita />
            <ChatBot/>
            
        </>
    )
}

export default Painel
