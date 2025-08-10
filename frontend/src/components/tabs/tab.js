// frontend/src/components/tabs/tab.js
import React from "react"

export const TabPanel = (props) => {
    const { children, value, index, ...other } = props
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <>{children}</>}
        </div>
    )
}
