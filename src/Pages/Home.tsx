import React, { useEffect, useState, useContext } from "react"
import { InferenceSession } from "onnxjs"
import _ from "lodash"
import "../assets/styles/home.scss"
import { Commet } from "react-loading-indicators"
import ImageSelector from "../components/ImageSelector"
import { ImageProperties, Result } from "../utils/types"
import * as runModelUtils from "../utils/helper"
import { ResultContext } from "../hooks/resultContext"
import ResultSection from "../components/ResultSection"
import loadImage from "blueimp-load-image"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"

const Home = () => {
    const [model, setModel] = useState<InferenceSession>()
    const [isLoading, setIsLoading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<ImageProperties>({})
    const context = useContext(ResultContext)
    if (!context) {
        throw new Error("ResultComponent must be used within a ResultProvider")
    }

    useEffect(() => {
        const loadModel = async () => {
            setIsLoading(true)

            // Initialize the ONNX Inference Session
            const session = new InferenceSession()

            // Load the ONNX model
            const response = await fetch("./resnet50v2.onnx")
            const modelFile = await response.arrayBuffer()

            await session.loadModel(modelFile)
            setModel(session)

            setIsLoading(false)
        }

        loadModel()
    }, [])

    const runModel = async () => {
        const element = document.getElementById(
            "input-canvas",
        ) as HTMLCanvasElement
        const ctx = element.getContext("2d") as CanvasRenderingContext2D
        const preprocessedData = runModelUtils.preprocess(ctx)
        let tensorOutput = null
        ;[tensorOutput] = await runModelUtils.runModel(model!, preprocessedData)
        const output = tensorOutput.data
        const result = runModelUtils.getPredictedClass(
            Array.prototype.slice.call(output) as any,
        ) as Result[]
        context.setIsLoading(false)
        context.setResult(result)
    }

    const loadImageToCanvas = (url: string) => {
        context.setIsLoading(true)
        loadImage(
            url,
            (img) => {
                if ((img as Event).type === "error") {
                } else {
                    const element = document.getElementById(
                        "input-canvas",
                    ) as HTMLCanvasElement
                    if (element) {
                        const ctx = element.getContext("2d")
                        if (ctx) {
                            ctx.drawImage(img as HTMLImageElement, 0, 0)

                            // session predict
                            setTimeout(() => {
                                runModel()
                            }, 10)
                        }
                    }
                }
            },
            {
                maxWidth: 224,
                maxHeight: 224,
                canvas: true,
                crossOrigin: "Anonymous",
            },
        )
    }

    const handleUploadImgage = (e: any) => {
        if (!e.target.files[0].name.match(/\.(jpg|jpeg|png|gif)$/i)) {
            toast.error("Please upload propriate image file!", {
                style: { textAlign: "left" },
            })
        } else {
            setSelectedImage({
                label: "Uploaded Image",
                value: URL.createObjectURL(e.target.files[0]),
            })
            loadImageToCanvas(URL.createObjectURL(e.target.files[0]))
        }
    }

    return (
        <>
            <div className="container">
                {!isLoading ? (
                    <>
                        <div className="title-container">
                            <h1>Predict By Image ONNX.js</h1>
                            <div>
                                Please select an image below to show the
                                prediction or{" "}
                                <label className="inputs">
                                    <span>UPLOAD IMAGE</span>
                                    <input
                                        style={{ display: "none" }}
                                        type="file"
                                        onChange={handleUploadImgage}
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="app-container">
                            <ImageSelector
                                img={selectedImage}
                                setImg={setSelectedImage}
                                session={model}
                            />

                            <ResultSection />
                        </div>
                        <div className="footer">
                            <div>© Powered by </div>
                            Duong Chi Kien - 519H0077 & Xuan Kim Long - 51900760
                        </div>
                        <ToastContainer />
                    </>
                ) : (
                    <Commet
                        color="#5e40de"
                        size="medium"
                        text=""
                        textColor=""
                    />
                )}
            </div>
        </>
    )
}

export default Home
