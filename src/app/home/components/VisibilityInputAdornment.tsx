'use client'
/*
 * @author: Dennis Chen
 */

import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import IconButton from "@mui/material/IconButton"
import InputAdornment from "@mui/material/InputAdornment"
/*
 * 
 * @author: Dennis Chen
 */

export type Props = {
    visible: boolean
    onClick: () => void
}

export default function VisibilityAdornment({ visible, onClick }: Props) {
    return <InputAdornment position="end">
        <IconButton
            onClick={onClick}
        >
            {visible ? <Visibility /> : <VisibilityOff />}
        </IconButton>
    </InputAdornment>
}