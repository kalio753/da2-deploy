import React, { useCallback, useContext } from "react"
import Select, { SingleValue } from "react-select"
import loadImage from "blueimp-load-image"
import { InferenceSession } from "onnxjs"
import * as runModelUtils from "../utils/helper"
import _ from "lodash"
import { ImageProperties, Result } from "../utils/types"
import { ResultContext } from "../hooks/resultContext"
import { RESNET50_IMAGE_URLS } from "../utils/contant"

interface ImageSelectorProps {
    session?: InferenceSession
    img: ImageProperties
    setImg: any
}

export default function ImageSelector({
    img,
    setImg,
    session,
}: ImageSelectorProps) {
    const context = useContext(ResultContext)
    if (!context) {
        throw new Error("ResultComponent must be used within a ResultProvider")
    }

    const runModel = useCallback(async () => {
        const element = document.getElementById(
            "input-canvas",
        ) as HTMLCanvasElement
        const ctx = element.getContext("2d") as CanvasRenderingContext2D
        const preprocessedData = runModelUtils.preprocess(ctx)
        let tensorOutput = null
        ;[tensorOutput] = await runModelUtils.runModel(
            session!,
            preprocessedData,
        )
        const output = tensorOutput.data
        const result = runModelUtils.getPredictedClass(
            Array.prototype.slice.call(output) as any,
        ) as Result[]
        context.setIsLoading(false)
        context.setResult(result)
    }, [context])

    const loadImageToCanvas = useCallback(
        (url: string) => {
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
        },
        [context],
    )

    return (
        <div className="image-selector-container">
            <Select
                options={RESNET50_IMAGE_URLS.map((item) => ({
                    ...item,
                    label:
                        item.label.charAt(0).toUpperCase() +
                        item.label.slice(1),
                }))}
                onChange={(newValue: SingleValue<ImageProperties>) => {
                    setImg(newValue)
                    // runModel()
                    loadImageToCanvas(newValue?.value || "")
                }}
                value={img}
                className="select-box"
            />

            <div className="img-container">
                <img
                    src={img.value}
                    id="imageResult"
                    style={{ background: img ? "#EEEEEE" : "unset" }}
                />
                <canvas
                    id="input-canvas"
                    style={{ background: img ? "#EEEEEE" : "unset" }}
                />
            </div>
        </div>
    )
}
