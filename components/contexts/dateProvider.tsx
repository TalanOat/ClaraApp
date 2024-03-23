import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

export type HeaderDate = {
    date: Date
}

export interface DateContextInterface {
    headerDate: HeaderDate
    setHeaderDate: Dispatch<SetStateAction<HeaderDate>>
}

const defaultState = {
    headerDate: {
        date: new Date()
    },
    setHeaderDate: (headerDate: HeaderDate) => {}
} as DateContextInterface

export const DateContext = createContext(defaultState)

type DateProviderProps = {
    children: ReactNode
}

export default function DateProvider({children}: DateProviderProps){
     const [headerDate, setHeaderDate] = useState<HeaderDate>(
        {
            date: new Date()
        }
     );

    return (
        <DateContext.Provider value={{ headerDate, setHeaderDate }}>
            {children}
        </DateContext.Provider>
    )

}

//export const dateContext = createContext({})