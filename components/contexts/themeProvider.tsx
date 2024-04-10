import { Dispatch, ReactNode, SetStateAction, createContext, useState } from "react";

export type Theme = {
    name: string
}

export interface ThemeContextInterface {
    theme: Theme
    setTheme: Dispatch<SetStateAction<Theme>>
}

const defaultState = {
    theme: {
        name: "purple"
    },
    setTheme: (theme: Theme) => {}
} as ThemeContextInterface

export const ThemeContext = createContext(defaultState)

type ThemeProviderProps = {
    children: ReactNode
}

export default function ThemeProvider({children}: ThemeProviderProps){
     const [theme, setTheme] = useState<Theme>(
        {
            name: "purple"
        }
     );

    return (
        <ThemeContext.Provider value={{ headerDate, setHeaderDate }}>
            {children}
        </ThemeContext.Provider>
    )

}

//export const dateContext = createContext({})