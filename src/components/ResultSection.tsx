import React, { Key, useContext } from "react"
import ProgressBar from "@ramonak/react-progress-bar"
import { OrbitProgress } from "react-loading-indicators"
import { ResultContext } from "../hooks/resultContext"
import { Result } from "../utils/types"

interface ProgressItemProps {
    result: Result
}

const ProgressItem = ({ result }: ProgressItemProps) => {
    return (
        <div className="progress-item">
            <div>
                {result.name.charAt(0).toUpperCase() + result.name.slice(1)}
            </div>
            <ProgressBar
                completed={((result?.probability as number) * 100).toFixed(2)}
                className="progress-bar"
                height="16px"
                animateOnRender={true}
            />
        </div>
    )
}

export default function ResultSection() {
    const context = useContext(ResultContext)
    if (!context) {
        throw new Error("ResultComponent must be used within a ResultProvider")
    }

    const { result, isLoading } = context

    return (
        <div className="result-container">
            {!isLoading ? (
                <>
                    {result?.length > 0 ? (
                        result?.map((res) => (
                            <ProgressItem key={res.id as Key} result={res} />
                        ))
                    ) : (
                        <></>
                    )}
                </>
            ) : (
                <div style={{ transform: "translateY(100%)" }}>
                    <OrbitProgress color="#5e40de" size="medium" />
                </div>
            )}
        </div>
    )
}
