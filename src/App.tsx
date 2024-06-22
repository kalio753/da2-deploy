import React, { FC } from "react"
import "./assets/styles/app.scss"
import Home from "./Pages/Home"
import { ResultProvider } from "./hooks/resultContext"

const App: FC = () => {
    return (
        <ResultProvider>
            <Home />
        </ResultProvider>
    )
}

export default App
