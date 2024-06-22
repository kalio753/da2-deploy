interface ImageProperties {
    label?: string
    value?: string
}

interface Result {
    id: String
    index: Number
    name: String
    probability: Number
}

interface ResultContextType {
    result: Result[]
    setResult: React.Dispatch<React.SetStateAction<Result[]>>
    isLoading: Boolean
    setIsLoading: React.Dispatch<React.SetStateAction<Boolean>>
}

export type { ImageProperties, Result, ResultContextType }
