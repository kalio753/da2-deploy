import { imagenetClasses } from "../data/imagenet"
import _ from "lodash"
import { InferenceSession, Tensor } from "onnxjs"
import ndarray from "ndarray"
import ops from "ndarray-ops"

export async function runModel(
    model: InferenceSession,
    preprocessedData: Tensor,
): Promise<[Tensor, number]> {
    const start = new Date()
    try {
        const outputData = await model.run([preprocessedData])
        const end = new Date()
        const inferenceTime = end.getTime() - start.getTime()
        const output = outputData.values().next().value
        return [output, inferenceTime]
    } catch (e) {
        console.error(e)
        throw new Error()
    }
}

export const preprocess = (ctx: CanvasRenderingContext2D): Tensor => {
    const imageData = ctx.getImageData(
        0,
        0,
        ctx.canvas.clientWidth,
        ctx.canvas.clientHeight,
    )
    const { data, width, height } = imageData

    // data processing
    const dataTensor = ndarray(new Float32Array(data), [width, height, 4])
    const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
        1,
        3,
        width,
        height,
    ])

    ops.assign(
        dataProcessedTensor.pick(0, 0, null, null),
        dataTensor.pick(null, null, 0),
    )
    ops.assign(
        dataProcessedTensor.pick(0, 1, null, null),
        dataTensor.pick(null, null, 1),
    )
    ops.assign(
        dataProcessedTensor.pick(0, 2, null, null),
        dataTensor.pick(null, null, 2),
    )

    ops.divseq(dataProcessedTensor, 255)
    ops.subseq(dataProcessedTensor.pick(0, 0, null, null), 0.485)
    ops.subseq(dataProcessedTensor.pick(0, 1, null, null), 0.456)
    ops.subseq(dataProcessedTensor.pick(0, 2, null, null), 0.406)

    ops.divseq(dataProcessedTensor.pick(0, 0, null, null), 0.229)
    ops.divseq(dataProcessedTensor.pick(0, 1, null, null), 0.224)
    ops.divseq(dataProcessedTensor.pick(0, 2, null, null), 0.225)

    const tensor = new Tensor(new Float32Array(3 * width * height), "float32", [
        1,
        3,
        width,
        height,
    ])
    ;(tensor.data as Float32Array).set(dataProcessedTensor.data)
    return tensor
}

export const getPredictedClass = (res: Float32Array): {} => {
    if (!res || res.length === 0) {
        const empty = []
        for (let i = 0; i < 5; i++) {
            empty.push({ name: "-", probability: 0, index: 0 })
        }
        return empty
    }
    const output = softmax(Array.prototype.slice.call(res))
    return imagenetClassesTopK(output, 5)
}

function softmax(arr: number[]): any {
    const C = Math.max(...arr)
    const d = arr.map((y) => Math.exp(y - C)).reduce((a, b) => a + b)
    return arr.map((value, index) => {
        return Math.exp(value - C) / d
    })
}

function imagenetClassesTopK(classProbabilities: any, k = 5) {
    const probs = _.isTypedArray(classProbabilities)
        ? Array.prototype.slice.call(classProbabilities)
        : classProbabilities

    const sorted = _.reverse(
        _.sortBy(
            probs.map((prob: any, index: number) => [prob, index]),
            (probIndex) => probIndex[0],
        ),
    )

    const topK = _.take(sorted, k).map((probIndex) => {
        const iClass = imagenetClasses[probIndex[1]]
        return {
            id: iClass[0],
            index: parseInt(probIndex[1], 10),
            name: iClass[1].replace(/_/g, " "),
            probability: probIndex[0],
        }
    })
    return topK
}
