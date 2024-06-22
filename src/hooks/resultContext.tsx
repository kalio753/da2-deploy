import { Result, ResultContextType } from "../utils/types"
import React, { createContext, useState, ReactNode } from "react"

const ResultContext = createContext<ResultContextType | undefined>(undefined)

interface ProviderProps {
    children: ReactNode
}

const ResultProvider = ({ children }: ProviderProps) => {
    const [result, setResult] = useState<Result[]>([])
    const [isLoading, setIsLoading] = useState<Boolean>(false)
    const value = {
        result,
        setResult,
        isLoading,
        setIsLoading,
    }

    return (
        <ResultContext.Provider value={value}>
            {children}
        </ResultContext.Provider>
    )
}

export { ResultContext, ResultProvider }
