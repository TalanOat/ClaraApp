import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

export type AddBoolean = {
    changed: boolean
}

export interface AddColorContextInterface {
    addBoolean: AddBoolean
    setAddBoolean: Dispatch<SetStateAction<AddBoolean>>
}

const defaultState = {
    addBoolean: {
        changed: false
    },
    setAddBoolean: (addBoolean: AddBoolean) => {}
} as AddColorContextInterface

export const AddColorContext = createContext(defaultState)

type AddColorProviderProps = {
    children: ReactNode
}

export default function AddColorProvider({children}: AddColorProviderProps){
     const [addBoolean, setAddBoolean] = useState<AddBoolean>(
        {
            changed: false
        }
     );

    return (
        <AddColorContext.Provider value={{ addBoolean, setAddBoolean }}>
            {children}
        </AddColorContext.Provider>
    )

}

//export const dateContext = createContext({})